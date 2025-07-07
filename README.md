# AI Ebook Reader

An AI-powered ebook reader with chat functionality using Google's Gemini API.

## Features

- Read and manage ebooks
- AI-powered chat integration
- Voice-to-text and text-to-speech capabilities
- Modern, responsive UI

## Run Locally

**Prerequisites:**
- Node.js 18 or higher
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sambuiks/ai-ebook-reader.git
   cd ai-ebook-reader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your-api-key-here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is deployed using GitHub Pages. The production build is automatically deployed through GitHub Actions.

### GitHub Actions

The project uses GitHub Actions for continuous deployment:
- Automatically builds and deploys on push to main branch
- Uses Vite for production build optimization
- Configured for GitHub Pages deployment

### Environment Variables

For production deployment, set the following secrets in your GitHub repository:
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key
- `VITE_API_KEY`: Your Google Gemini API key (duplicate for compatibility)
