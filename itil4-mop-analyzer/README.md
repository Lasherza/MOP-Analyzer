# ITIL 4 MOP Analyzer

> A comprehensive web application for analyzing Method of Procedure (MOP) documents based on ITIL 4 Change Enablement best practices for the telecommunications industry.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## ?? Overview

The ITIL 4 MOP Analyzer is an AI-powered application that evaluates telecommunications Method of Procedure documents against industry best practices. It analyzes three critical sections:

- **Pre-Checks**: Environmental verification, backups, prerequisites
- **Operation Steps**: Implementation procedures and validation
- **Rollback Steps**: Recovery procedures and contingency plans

Each section is scored out of 100, with comprehensive recommendations for improvement based on ITIL 4 standards and real-time industry research via Tavily API.

## ? Features

### Core Functionality
- **Multi-Category Support**: 9 telecommunications categories including IPCORE, Packet Core, Radio Network, etc.
- **Document Processing**: Supports PDF and Word documents (.pdf, .docx, .doc)
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent document analysis
- **Industry Standards Integration**: Real-time web search via Tavily API for current best practices
- **Comprehensive Scoring**: 0-100 scoring system for each section
- **Risk Assessment**: Automatic risk level calculation (LOW, MEDIUM, HIGH, CRITICAL)
- **Detailed Recommendations**: Tailored suggestions for improvement
- **PDF Report Generation**: Professional downloadable reports
- **Secure Storage**: Encrypted file storage with SQLite database

### User Interface
- **Clean, Modern Design**: Built with React and Tailwind CSS
- **Intuitive Upload Flow**: Drag-and-drop file upload
- **Real-time Analysis**: Progress indicators during processing
- **Interactive Results**: Visual score displays with circular progress indicators
- **Responsive Design**: Works on desktop and mobile devices

### Security
- **File Validation**: Type and size checking
- **Secure Upload**: Protected file handling
- **Data Encryption**: Encrypted file paths
- **Security Headers**: CORS, XSS protection, content security policy
- **Input Sanitization**: Protection against injection attacks

## ??? Architecture

```
itil4-mop-analyzer/
??? backend/                    # FastAPI Backend
?   ??? app/
?   ?   ??? api/               # API routes
?   ?   ??? core/              # Configuration
?   ?   ??? models/            # Data models and database
?   ?   ??? services/          # Business logic
?   ?   ?   ??? document_processor.py
?   ?   ?   ??? mop_analyzer.py
?   ?   ?   ??? tavily_service.py
?   ?   ?   ??? report_generator.py
?   ?   ??? utils/             # Utilities and security
?   ?   ??? middleware/        # Security middleware
?   ??? requirements.txt
?   ??? .env.example
?   ??? Dockerfile
??? frontend/                   # React Frontend
?   ??? src/
?   ?   ??? components/
?   ?   ?   ??? Header.jsx
?   ?   ?   ??? UploadForm.jsx
?   ?   ?   ??? AnalysisResults.jsx
?   ?   ??? App.jsx
?   ?   ??? main.jsx
?   ??? package.json
?   ??? Dockerfile
??? docker-compose.yml
```

## ?? Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Tavily API Key** ([Get one here](https://tavily.com))

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd itil4-mop-analyzer
   ```

2. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   SECRET_KEY=your_secret_key_here_change_in_production
   ```

3. **Start the application**
   ```bash
   cd ..
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Run the backend**
   ```bash
   python run.py
   ```
   
   The API will be available at http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:3000

## ?? Usage Guide

### Analyzing a MOP Document

1. **Select Category**: Choose the appropriate telecommunications category for your MOP
   - IPCORE
   - Packet Core
   - Billing and Revenue ? Charging/Revenue Management
   - Radio Network
   - Transmission Network
   - DevOps and Systems (OSS and BSS)
   - IT
   - Cyber Security
   - Data Engineering

2. **Upload Document**: 
   - Click the upload area or drag and drop your MOP document
   - Supported formats: PDF (.pdf), Word (.docx, .doc)
   - Maximum file size: 10MB

3. **Submit for Analysis**: Click "Analyze MOP" button
   - Analysis typically takes 30-90 seconds
   - Progress indicator shows processing status

4. **Review Results**:
   - **Overall Score**: Composite score out of 100
   - **Risk Level**: LOW, MEDIUM, HIGH, or CRITICAL
   - **Section Scores**: Individual scores for Pre-Checks, Operation Steps, and Rollback Steps
   - **Recommendations**: Specific improvement suggestions
   - **Best Practices**: Industry standards and guidelines
   - **Detailed Findings**: In-depth analysis of each section

5. **Download Report**: Click "Download Report" to get a professional PDF report

## ?? Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_key_here

# Tavily API Configuration
TAVILY_API_KEY=your_key_here

# Application Settings
APP_NAME=ITIL4 MOP Analyzer
DEBUG=False

# Security
SECRET_KEY=generate_a_secure_random_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=.pdf,.docx,.doc

# Database
DATABASE_URL=sqlite+aiosqlite:///./database/mop_analyzer.db

# CORS - Add your production domains
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Scoring Algorithm

The overall score is calculated as a weighted average:
- **Pre-Checks**: 30%
- **Operation Steps**: 40%
- **Rollback Steps**: 30%

**Score Interpretation**:
- **90-100**: Excellent - Comprehensive, detailed, follows all best practices
- **75-89**: Good - Most criteria met, minor improvements needed
- **60-74**: Adequate - Basic requirements met, several improvements needed
- **40-59**: Poor - Missing critical elements, significant gaps
- **0-39**: Inadequate - Major deficiencies

**Risk Levels**:
- **LOW**: Score ? 85
- **MEDIUM**: Score 70-84
- **HIGH**: Score 50-69
- **CRITICAL**: Score < 50

## ?? Security Features

### Data Protection
- **Encrypted File Paths**: All file paths are encrypted before database storage
- **Secure File Upload**: Validated file types and sizes
- **Input Sanitization**: Protection against SQL injection and XSS attacks
- **Secure Headers**: CORS, XSS Protection, Content Security Policy

### GDPR Compliance Considerations
- Files are stored temporarily and can be automatically deleted
- Personal data is minimized
- Analysis data includes only technical content
- Audit trail of all analyses

### Best Practices
- Keep API keys in `.env` files, never commit them
- Use strong SECRET_KEY in production
- Enable HTTPS in production
- Regularly update dependencies
- Monitor and rotate API keys

## ?? API Documentation

### Endpoints

#### `POST /api/analyze`
Upload and analyze a MOP document.

**Request**:
- `file`: multipart/form-data (PDF or Word document)
- `category`: string (one of the 9 categories)

**Response**: `MOPAnalysisResult` object

#### `GET /api/analysis/{analysis_id}`
Retrieve analysis results by ID.

**Response**: `MOPAnalysisResult` object

#### `GET /api/analysis/{analysis_id}/report`
Download PDF report for an analysis.

**Response**: PDF file

#### `GET /api/categories`
Get list of available categories.

**Response**: Array of category names

#### `GET /api/health`
Health check endpoint.

**Response**: Status object

### Full API Documentation
Visit http://localhost:8000/docs for interactive Swagger documentation.

## ?? Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## ?? Deployment

### Production Deployment

1. **Environment Configuration**
   - Set `DEBUG=False` in production
   - Use strong `SECRET_KEY`
   - Configure production domains in `ALLOWED_ORIGINS`
   - Use production-grade database (PostgreSQL recommended)

2. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Environment Variables**
   - Store sensitive keys in secure vaults (AWS Secrets Manager, Azure Key Vault, etc.)
   - Use environment-specific .env files

4. **HTTPS Configuration**
   - Use reverse proxy (nginx, Caddy)
   - Configure SSL certificates (Let's Encrypt recommended)

5. **Monitoring**
   - Set up logging and monitoring
   - Configure alerts for errors
   - Monitor API usage and costs

## ?? Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ?? License

This project is licensed under the MIT License - see the LICENSE file for details.

## ?? Acknowledgments

- **ITIL 4**: Framework for IT service management
- **OpenAI**: GPT-4 for intelligent analysis
- **Tavily**: Real-time web search for industry standards
- **FastAPI**: Modern, fast Python web framework
- **React**: UI component library
- **Tailwind CSS**: Utility-first CSS framework

## ?? Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: support@example.com

## ??? Roadmap

- [ ] Multi-language support
- [ ] Historical analysis comparison
- [ ] Team collaboration features
- [ ] Custom scoring templates
- [ ] Integration with ITSM tools
- [ ] Advanced reporting and analytics
- [ ] Automated MOP generation assistance
- [ ] Real-time collaboration
- [ ] Mobile app

## ?? Additional Resources

- [ITIL 4 Documentation](https://www.axelos.com/certifications/itil-service-management)
- [Change Enablement Best Practices](https://www.axelos.com/certifications/itil-service-management/change-enablement)
- [Telecommunications Standards](https://www.itu.int/en/ITU-T/Pages/default.aspx)

---

**Built with ?? for Telecommunications Professionals**
