/**
 * Resume Extraction Module
 * Handles parsing and extracting data from various resume formats
 */

export class ResumeExtractor {
  constructor(config = {}) {
    this.config = {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      supportedFormats: ['pdf', 'docx', 'doc', 'txt'],
      ...config
    };
  }

  /**
   * Extract data from uploaded resume file
   */
  async extractFromFile(file) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const fileExtension = this.getFileExtension(file.name);
      let extractedText = '';

      // Extract text based on file type
      switch (fileExtension) {
        case 'pdf':
          extractedText = await this.extractFromPDF(file);
          break;
        case 'docx':
        case 'doc':
          extractedText = await this.extractFromWord(file);
          break;
        case 'txt':
          extractedText = await this.extractFromText(file);
          break;
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Parse the extracted text into structured data
      const structuredData = await this.parseResumeText(extractedText);

      return {
        success: true,
        originalText: extractedText,
        structuredData,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: fileExtension,
          extractedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Resume extraction error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          extractedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate uploaded file
   */
  validateFile(file) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size > this.config.maxFileSize) {
      return { 
        isValid: false, 
        error: `File size exceeds ${this.config.maxFileSize / 1024 / 1024}MB limit` 
      };
    }

    const extension = this.getFileExtension(file.name);
    if (!this.config.supportedFormats.includes(extension)) {
      return { 
        isValid: false, 
        error: `Unsupported file format. Supported: ${this.config.supportedFormats.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    return filename.toLowerCase().split('.').pop();
  }

  /**
   * Extract text from PDF file (browser-based)
   */
  async extractFromPDF(file) {
    try {
      // Use PDF.js for browser-based extraction
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }

        return fullText.trim();
      } else {
        // Fallback for server-side or when PDF.js is not available
        throw new Error('PDF extraction not available. Please convert to text format.');
      }
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from Word document
   */
  async extractFromWord(file) {
    try {
      // Use mammoth.js for DOCX extraction
      if (typeof window !== 'undefined' && window.mammoth) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        throw new Error('Word document extraction not available. Please convert to text format.');
      }
    } catch (error) {
      throw new Error(`Word document extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from text file
   */
  async extractFromText(file) {
    try {
      return await file.text();
    } catch (error) {
      throw new Error(`Text file reading failed: ${error.message}`);
    }
  }

  /**
   * Parse extracted text into structured resume data
   */
  async parseResumeText(text) {
    const structuredData = {
      personalInfo: this.extractPersonalInfo(text),
      summary: this.extractSummary(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text),
      skills: this.extractSkills(text),
      projects: this.extractProjects(text),
      certifications: this.extractCertifications(text),
      achievements: this.extractAchievements(text)
    };

    return structuredData;
  }

  /**
   * Extract personal information
   */
  extractPersonalInfo(text) {
    const personalInfo = {
      name: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null
    };

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      personalInfo.email = emailMatch[0];
    }

    // Extract phone number
    const phoneMatch = text.match(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn URL
    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/);
    if (linkedinMatch) {
      personalInfo.linkedin = linkedinMatch[0];
    }

    // Extract GitHub URL
    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-]+/);
    if (githubMatch) {
      personalInfo.github = githubMatch[0];
    }

    // Extract website URL
    const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
    if (websiteMatch && !websiteMatch[0].includes('linkedin.com') && !websiteMatch[0].includes('github.com')) {
      personalInfo.website = websiteMatch[0];
    }

    // Extract name (usually the first line or before contact info)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    for (const line of lines.slice(0, 5)) {
      if (!line.includes('@') && !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && line.length > 2 && line.length < 50) {
        // Likely a name if it doesn't contain email, phone, and is reasonable length
        if (!personalInfo.name) {
          personalInfo.name = line;
          break;
        }
      }
    }

    return personalInfo;
  }

  /**
   * Extract professional summary
   */
  extractSummary(text) {
    const summaryKeywords = /(?:summary|profile|objective|about|overview|professional summary)/i;
    const lines = text.split('\n');
    
    let summaryIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (summaryKeywords.test(lines[i])) {
        summaryIndex = i;
        break;
      }
    }

    if (summaryIndex >= 0) {
      // Extract next few lines as summary
      const summaryLines = [];
      for (let i = summaryIndex + 1; i < Math.min(summaryIndex + 10, lines.length); i++) {
        const line = lines[i].trim();
        if (line && !this.isHeaderLine(line)) {
          summaryLines.push(line);
        } else if (summaryLines.length > 0) {
          break;
        }
      }
      return summaryLines.join(' ');
    }

    return null;
  }

  /**
   * Extract work experience
   */
  extractExperience(text) {
    const experienceKeywords = /(?:experience|employment|work history|professional experience)/i;
    const jobTitlePatterns = /\b(?:engineer|developer|manager|analyst|designer|specialist|consultant|director|senior|junior|lead|principal)\b/i;
    
    const experiences = [];
    const lines = text.split('\n');
    
    let inExperienceSection = false;
    let currentJob = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (experienceKeywords.test(trimmedLine)) {
        inExperienceSection = true;
        continue;
      }

      if (inExperienceSection && trimmedLine) {
        // Check if this looks like a new job title
        if (jobTitlePatterns.test(trimmedLine) || this.containsCompanyIndicators(trimmedLine)) {
          if (currentJob) {
            experiences.push(currentJob);
          }
          
          currentJob = {
            title: trimmedLine,
            company: null,
            duration: null,
            description: []
          };
        } else if (currentJob && this.looksLikeDuration(trimmedLine)) {
          currentJob.duration = trimmedLine;
        } else if (currentJob && trimmedLine.length > 10) {
          currentJob.description.push(trimmedLine);
        } else if (this.isHeaderLine(trimmedLine)) {
          if (currentJob) {
            experiences.push(currentJob);
          }
          break;
        }
      }
    }

    if (currentJob) {
      experiences.push(currentJob);
    }

    return experiences.map(exp => ({
      ...exp,
      description: exp.description.join(' ')
    }));
  }

  /**
   * Extract education information
   */
  extractEducation(text) {
    const educationKeywords = /(?:education|academic|university|college|degree|school)/i;
    const degreePatterns = /\b(?:bachelor|master|phd|doctorate|associate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba)\b/i;
    
    const education = [];
    const lines = text.split('\n');
    
    let inEducationSection = false;
    let currentEducation = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (educationKeywords.test(trimmedLine)) {
        inEducationSection = true;
        continue;
      }

      if (inEducationSection && trimmedLine) {
        if (degreePatterns.test(trimmedLine) || this.containsEducationIndicators(trimmedLine)) {
          if (currentEducation) {
            education.push(currentEducation);
          }
          
          currentEducation = {
            degree: trimmedLine,
            institution: null,
            duration: null,
            details: []
          };
        } else if (currentEducation && this.looksLikeDuration(trimmedLine)) {
          currentEducation.duration = trimmedLine;
        } else if (currentEducation && trimmedLine.length > 5) {
          if (!currentEducation.institution && this.looksLikeInstitution(trimmedLine)) {
            currentEducation.institution = trimmedLine;
          } else {
            currentEducation.details.push(trimmedLine);
          }
        } else if (this.isHeaderLine(trimmedLine)) {
          if (currentEducation) {
            education.push(currentEducation);
          }
          break;
        }
      }
    }

    if (currentEducation) {
      education.push(currentEducation);
    }

    return education.map(edu => ({
      ...edu,
      details: edu.details.join(' ')
    }));
  }

  /**
   * Extract skills
   */
  extractSkills(text) {
    const skillsKeywords = /(?:skills|technologies|technical skills|programming|languages|tools)/i;
    const lines = text.split('\n');
    
    let skillsIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (skillsKeywords.test(lines[i])) {
        skillsIndex = i;
        break;
      }
    }

    const skills = {
      technical: [],
      languages: [],
      tools: [],
      other: []
    };

    if (skillsIndex >= 0) {
      for (let i = skillsIndex + 1; i < Math.min(skillsIndex + 20, lines.length); i++) {
        const line = lines[i].trim();
        if (line && !this.isHeaderLine(line)) {
          // Split by common delimiters
          const skillItems = line.split(/[,;|•\n]/).map(s => s.trim()).filter(s => s.length > 1);
          
          for (const skill of skillItems) {
            if (this.isProgrammingLanguage(skill)) {
              skills.technical.push(skill);
            } else if (this.isSpokenLanguage(skill)) {
              skills.languages.push(skill);
            } else if (this.isTool(skill)) {
              skills.tools.push(skill);
            } else {
              skills.other.push(skill);
            }
          }
        } else if (this.isHeaderLine(line)) {
          break;
        }
      }
    }

    return skills;
  }

  /**
   * Extract projects
   */
  extractProjects(text) {
    const projectKeywords = /(?:projects|portfolio|personal projects|side projects)/i;
    const lines = text.split('\n');
    
    let inProjectsSection = false;
    const projects = [];
    let currentProject = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (projectKeywords.test(trimmedLine)) {
        inProjectsSection = true;
        continue;
      }

      if (inProjectsSection && trimmedLine) {
        if (this.looksLikeProjectTitle(trimmedLine)) {
          if (currentProject) {
            projects.push(currentProject);
          }
          
          currentProject = {
            title: trimmedLine,
            description: [],
            technologies: [],
            url: null
          };
        } else if (currentProject && trimmedLine.length > 10) {
          // Check for URL
          const urlMatch = trimmedLine.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            currentProject.url = urlMatch[0];
          } else {
            currentProject.description.push(trimmedLine);
          }
        } else if (this.isHeaderLine(trimmedLine)) {
          if (currentProject) {
            projects.push(currentProject);
          }
          break;
        }
      }
    }

    if (currentProject) {
      projects.push(currentProject);
    }

    return projects.map(project => ({
      ...project,
      description: project.description.join(' ')
    }));
  }

  /**
   * Extract certifications
   */
  extractCertifications(text) {
    const certKeywords = /(?:certifications|certificates|licensed|certified)/i;
    const lines = text.split('\n');
    
    let inCertSection = false;
    const certifications = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (certKeywords.test(trimmedLine)) {
        inCertSection = true;
        continue;
      }

      if (inCertSection && trimmedLine) {
        if (!this.isHeaderLine(trimmedLine) && trimmedLine.length > 5) {
          certifications.push({
            name: trimmedLine,
            issuer: null,
            date: this.extractDateFromText(trimmedLine)
          });
        } else if (this.isHeaderLine(trimmedLine)) {
          break;
        }
      }
    }

    return certifications;
  }

  /**
   * Extract achievements
   */
  extractAchievements(text) {
    const achievementKeywords = /(?:achievements|awards|honors|accomplishments)/i;
    const lines = text.split('\n');
    
    let inAchievementSection = false;
    const achievements = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (achievementKeywords.test(trimmedLine)) {
        inAchievementSection = true;
        continue;
      }

      if (inAchievementSection && trimmedLine) {
        if (!this.isHeaderLine(trimmedLine) && trimmedLine.length > 5) {
          achievements.push({
            title: trimmedLine,
            date: this.extractDateFromText(trimmedLine)
          });
        } else if (this.isHeaderLine(trimmedLine)) {
          break;
        }
      }
    }

    return achievements;
  }

  // Utility methods for text analysis
  isHeaderLine(line) {
    const headerPatterns = /^(?:experience|education|skills|projects|certifications|achievements|awards|summary|objective|profile)/i;
    return headerPatterns.test(line.trim()) || line.trim().length < 3;
  }

  containsCompanyIndicators(line) {
    const indicators = /\b(?:inc|corp|llc|ltd|company|technologies|systems|solutions|group|team|startup)\b/i;
    return indicators.test(line);
  }

  containsEducationIndicators(line) {
    const indicators = /\b(?:university|college|institute|school|academy|education|studied)\b/i;
    return indicators.test(line);
  }

  looksLikeDuration(line) {
    const durationPatterns = /\b(?:20\d{2}|19\d{2}|\d{1,2}\/\d{2,4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current|\d+\s*(?:year|month|yr|mo)s?)\b/i;
    return durationPatterns.test(line) && line.length < 50;
  }

  looksLikeInstitution(line) {
    const patterns = /\b(?:university|college|institute|school|academy)\b/i;
    return patterns.test(line);
  }

  looksLikeProjectTitle(line) {
    // Project titles are usually short and don't contain common sentence indicators
    return line.length < 100 && !line.includes('.') && !line.includes(',') && line.split(' ').length < 8;
  }

  isProgrammingLanguage(skill) {
    const languages = /\b(?:javascript|python|java|c\+\+|c#|php|ruby|go|rust|kotlin|swift|typescript|html|css|sql|r|matlab|scala|perl|dart|objective-c)\b/i;
    return languages.test(skill);
  }

  isSpokenLanguage(skill) {
    const languages = /\b(?:english|spanish|french|german|chinese|japanese|korean|arabic|portuguese|russian|italian|dutch|hindi)\b/i;
    return languages.test(skill);
  }

  isTool(skill) {
    const tools = /\b(?:git|docker|kubernetes|aws|azure|gcp|linux|windows|macos|vscode|intellij|photoshop|figma|sketch|adobe|office|excel|powerpoint)\b/i;
    return tools.test(skill);
  }

  extractDateFromText(text) {
    const dateMatch = text.match(/\b(?:20\d{2}|19\d{2}|\d{1,2}\/\d{2,4})\b/);
    return dateMatch ? dateMatch[0] : null;
  }
}

export default ResumeExtractor;