# 🎨 **Interactive Resume Builder**

## 📝 About
The **Interactive Resume Builder** is an intuitive tool for crafting visually stunning and interactive resumes. Customize, export, and even host your resume effortlessly with this easy-to-use app.

---

## ✨ Features
- 🎨 **Live Preview**: See real-time updates while editing.
- 💾 **Persistent Storage**: Save your progress and pick up where you left off.
- 🤖 **AI Agent Detection**: Automatically detects and displays installed AI agents on your system.
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
- 🎯 **Modern UI**: Beautiful, modern interface with smooth animations and transitions.

---

## 🚀 Getting Started

### ✅ Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Safari).

---

### 🛠️ Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ItIsCiprian/Interactive-Resume-Builder.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd Interactive-Resume-Builder
   ```
3. **Detect AI Agents** (Optional but recommended):
   ```bash
   node detect-ai-agent.js
   ```
   This will scan your system for installed AI agents and generate an `ai-agents.json` file that the application will use to display AI agent information.

4. **Open the `index.html` file in your browser**.

---

## 🎯 Usage Guide

1️⃣ **Fill out the form** with your personal details, work experience, education, and other relevant sections.
2️⃣ **Add your skills** one by one.
3️⃣ **See the live preview** of your resume on the right side of the screen.
4️⃣ **Your progress is automatically saved** in your browser's local storage.
5️⃣ **View AI Agent Status**: Check the AI Agent Info section to see what AI agents are installed on your system.

### 🤖 AI Agent Detection

The application can detect and display information about AI agents installed on your system:

- **Supported Package Managers**: npm (global packages), pip3 (Python packages)
- **Supported AI Tools**: Ollama, OpenAI CLI, Anthropic CLI, and more
- **Detection**: Run `node detect-ai-agent.js` to scan your system and generate the agent information file

The detected AI agents will be displayed in a beautiful card at the bottom of the application interface.

---

## 🤝 Contributing

We welcome contributions! Follow these steps to get involved:

1. Fork the Repository.
2. Create a New Branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit Your Changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to Your Branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

## 🏗️ Project Structure

```
Interactive-Resume-Builder/
├── index.html          # Main HTML file
├── style.css           # Modern, responsive stylesheet
├── script.js           # Application logic and functionality
├── detect-ai-agent.js  # AI agent detection script
├── ai-agents.json      # Generated AI agent information (auto-generated)
└── README.md           # This file
```

## 🔧 Technical Details

### AI Agent Detection

The `detect-ai-agent.js` script scans your system for:
- **npm global packages**: Checks for AI-related npm packages (e.g., `@anthropic-ai/claude-code`)
- **Python packages**: Scans pip3 for AI libraries (OpenAI, Anthropic, LangChain, etc.)
- **System tools**: Detects Ollama and other AI runtime environments

The detected information is saved to `ai-agents.json`, which is then loaded by the frontend application.

### Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📜 License

This project is distributed under the MIT License. For more details, refer to the LICENSE file.

---

## 📬 Contact

👤 **Your Name**
- 📧 Email: ionutcipriananescu@example.com
- 🐦 Twitter: @ItisCiprian
- 🌐 Project Link: [Interactive Resume Builder](https://github.com/ItIsCiprian/Interactive-Resume-Builder)
