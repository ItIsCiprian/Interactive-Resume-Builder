#!/usr/bin/env node

/**
 * AI Agent Detection Script
 * Detects installed AI agents on the system and generates a JSON file
 * that can be consumed by the frontend application.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AI_AGENTS_FILE = path.join(__dirname, 'ai-agents.json');

/**
 * Detect AI agents installed on the system
 */
function detectAIAgents() {
  const agents = [];

  // Check for npm global packages
  try {
    const npmList = execSync('npm list -g --depth=0 --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const npmPackages = JSON.parse(npmList);
    
    if (npmPackages.dependencies) {
      // Check for Anthropic Claude Code
      if (npmPackages.dependencies['@anthropic-ai/claude-code']) {
        agents.push({
          name: '@anthropic-ai/claude-code',
          version: npmPackages.dependencies['@anthropic-ai/claude-code'].version,
          type: 'npm',
          description: 'Anthropic Claude Code - AI coding assistant'
        });
      }

      // Check for OpenAI packages
      Object.keys(npmPackages.dependencies).forEach(pkg => {
        if (pkg.includes('openai') && !agents.find(a => a.name === pkg)) {
          agents.push({
            name: pkg,
            version: npmPackages.dependencies[pkg].version,
            type: 'npm',
            description: 'OpenAI API client'
          });
        }
      });
    }
  } catch (error) {
    console.warn('Could not check npm global packages:', error.message);
  }

  // Check for Python packages
  try {
    const pipList = execSync('pip3 list --format=json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const pipPackages = JSON.parse(pipList);
    
    const aiPackages = ['openai', 'anthropic', 'langchain', 'huggingface', 'transformers', 'torch', 'tensorflow'];
    
    pipPackages.forEach(pkg => {
      if (aiPackages.some(aiPkg => pkg.name.toLowerCase().includes(aiPkg))) {
        agents.push({
          name: pkg.name,
          version: pkg.version,
          type: 'pip',
          description: `Python AI package: ${pkg.name}`
        });
      }
    });
  } catch (error) {
    console.warn('Could not check pip packages:', error.message);
  }

  // Check for Ollama
  try {
    execSync('which ollama', { stdio: 'ignore' });
    try {
      const ollamaList = execSync('ollama list', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      if (ollamaList.trim()) {
        agents.push({
          name: 'ollama',
          version: 'installed',
          type: 'system',
          description: 'Ollama - Local LLM runtime',
          models: ollamaList.split('\n').slice(1).filter(line => line.trim()).length
        });
      }
    } catch (e) {
      agents.push({
        name: 'ollama',
        version: 'installed',
        type: 'system',
        description: 'Ollama - Local LLM runtime (no models detected)'
      });
    }
  } catch (error) {
    // Ollama not installed
  }

  return agents;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Detecting AI agents on the system...\n');
  
  const agents = detectAIAgents();
  
  if (agents.length === 0) {
    console.log('❌ No AI agents detected.\n');
    // Write empty array to file
    fs.writeFileSync(AI_AGENTS_FILE, JSON.stringify([], null, 2));
    return;
  }

  console.log(`✅ Found ${agents.length} AI agent(s):\n`);
  agents.forEach(agent => {
    console.log(`  • ${agent.name} (${agent.version}) - ${agent.type}`);
    if (agent.description) {
      console.log(`    ${agent.description}`);
    }
  });
  console.log('');

  // Write to JSON file
  fs.writeFileSync(AI_AGENTS_FILE, JSON.stringify(agents, null, 2));
  console.log(`📝 AI agent information saved to: ${AI_AGENTS_FILE}\n`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { detectAIAgents };

