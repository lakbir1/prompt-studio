const fs = require('fs');
const path = require('path');

async function testApi() {
  const imagePath = path.join(__dirname, 'test-image.png');
  const imageBuffer = fs.readFileSync(imagePath);
  
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  formData.append('image', blob, 'test-image.png');
  
  try {
    console.log('Testing API endpoint: POST http://localhost:3000/api/analyze');
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();
