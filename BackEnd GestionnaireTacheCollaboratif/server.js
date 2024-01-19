const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;
const { createCanvas, loadImage } = require('canvas');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Replace with the actual origin of your Angular app
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Include DELETE method
  next();
});
// Increase the limit for the request body
app.use(bodyParser.json({ limit: '1Gb' })); // Adjust the limit as needed

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..' ,'src', 'assets', 'avatars'));
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Function to delete an issue from data.json
function deleteIssueFromData(issueId) {
  // Load existing data from data.json
  const dataFilePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataFilePath);
  let data = JSON.parse(rawData);

  // Find and remove the issue with the specified ID
  data.issues = data.issues.filter(issue => issue.id !== issueId);

  // Save the updated data back to data.json
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}
function authenticateUser(email, password, data) {
  if (data.users && Array.isArray(data.users)) {
    return data.users.find(u => u.email === email && u.password === password);
  } else {
    return null;
  }
}

function registerUser(newUser, data) {
  if (data.users && Array.isArray(data.users)) {
    const existingUser = data.users.find(u => u.email === newUser.email);

    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    } else {
      data.users.push(newUser);
      return { success: true, message: 'Sign-up successful.', user: newUser };
    }
  } else {
    return { success: false, message: 'Invalid data file format.' };
  }
}

function getUserByEmail(userEmail, data) {
  const users = data.users || [];
  const user = users.find(u => u.email === userEmail);

  if (user) {
    const formattedUser = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email
    };
    return { success: true, user: formattedUser };
  } else {
    return { success: false, message: 'User not found.' };
  }
}

function updateUserByEmail(email, updatedUser) {
  const dataFilePath = path.join(__dirname, 'data.json');

  try {
    // Check if the file exists
    fs.accessSync(dataFilePath, fs.constants.R_OK);

    const rawData = fs.readFileSync(dataFilePath);
    const data = JSON.parse(rawData);

    // Check if the "users" array exists in data.json
    if (data.users && Array.isArray(data.users)) {
      // Find the user with the specified email
      const existingUserIndex = data.users.findIndex(u => u.email === email);

      if (existingUserIndex !== -1) {
        // Update the existing user
        data.users[existingUserIndex] = updatedUser;

        // Save the updated data back to data.json
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        console.log('User updated successfully:', updatedUser);
        return true;
      } else {
        console.log('User not found:', email);
        return false;
      }
    } else {
      console.log('Invalid data file format.');
      return false;
    }
  } catch (err) {
    console.log('Error reading or writing data file:', err);
    return false;
  }
}


// Function to update an issue in data.json
function updateIssueInData(issue) {
  const dataFilePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataFilePath);
  let data = JSON.parse(rawData);

  // Check if the issue already exists
  const existingIssueIndex = data.issues.findIndex(existingIssue => existingIssue.id === issue.id);

  if (existingIssueIndex !== -1) {
    // Update the existing issue
    data.issues[existingIssueIndex] = issue;
  } else {
    // Add the new issue to the array
    data.issues.push(issue);
  }

  // Check if issue.description contains an <img> tag
  while (issue.description.includes('<img') && issue.description.includes('data:image')) {

    // Extract base64-encoded data from the <img> tag
    const matches = issue.description.match(/<img.*?src=\"data:image\/png;base64,(.*?)\".*?>/);
    if (matches && matches[1]) {
      const base64Data = matches[1];

      // Decode base64 data and create a Buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate a unique image file name incorporating timestamp
      const timestamp = Date.now();
      const imgPath = path.join(__dirname, '..', 'src', 'assets', 'img', `${issue.title}_${timestamp}.png`);
      fs.writeFileSync(imgPath, buffer);
      // Save the buffer as an image


      // Replace the <img> tag with a new tag containing the path to the created image
      issue.description = issue.description.replace(/<img.*?src="data:image\/png;base64,(.*?)".*?>/g, `<img src="assets/img/${issue.title}_${timestamp}.png" alt="${issue.title}">`);
    }
  }

  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Function to update an issue comment in data.json
function updateIssueCommentInData(issueId, comment) {
  const dataFilePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataFilePath);
  let data = JSON.parse(rawData);

  // Find the issue with the specified ID
  const issueToUpdate = data.issues.find(existingIssue => existingIssue.id === issueId);

  if (issueToUpdate) {
    // Ensure that the 'comments' array exists
    if (!issueToUpdate.comments) {
      issueToUpdate.comments = [];
    }
    // Check if the comment already exists
    const existingCommentIndex = issueToUpdate.comments.findIndex(existingComment => existingComment.id === comment.id);

    if (existingCommentIndex !== -1) {
      // Update the existing comment
      issueToUpdate.comments[existingCommentIndex] = {
        id: comment.id,
        issueId: issueId,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body
      };
      console.log(`Comment with ID ${comment.id} updated in issue with ID ${issueId} successfully.`);
    } else {
      // Add the new comment to the issue
      if (!issueToUpdate.comments) {
        issueToUpdate.comments = [];
      }
      issueToUpdate.comments.push({
        id: comment.id,
        issueId: issueId,
        user: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body
      });
      console.log(`New comment added to issue with ID ${issueId} successfully.`);
    }

    // Save the updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } else {
    console.log(`Issue with ID ${issueId} not found.`);
  }
}


// Function to delete a comment from an issue in data.json
function deleteCommentFromIssue(issueId, commentId) {
  const dataFilePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataFilePath);
  let data = JSON.parse(rawData);

  // Find the issue with the specified ID
  const issue = data.issues.find(existingIssue => existingIssue.id === issueId);

  if (issue) {
    // Find and remove the comment with the specified ID from the issue
    issue.comments = issue.comments.filter(comment => comment.id !== commentId);

    // Save the updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  }
}


// Add this endpoint to get a user by email
app.get('/data/auth/:email', (req, res) => {
  const userEmail = req.params.email;
  const dataFilePath = path.join(__dirname, 'data.json');

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const jsonData = JSON.parse(data);
      const users = jsonData.users || [];

      // Find the user with the specified email
      const user = users.find(u => u.email === userEmail);

      if (user) {
        // Format the response in the desired form
        const formattedUser = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          email: user.email
        };

        res.set('Content-Type', 'application/json');
        res.send(formattedUser);
      } else {
        res.status(404).json({ message: 'User not found.' });
      }
    }
  });
});

// Endpoint to update a user by email
app.put('/data/auth/:email/update', (req, res) => {
  const userEmail = req.params.email;
  const updatedUser = req.body;

  const success = updateUserByEmail(userEmail, updatedUser);

  if (success) {
    res.json({ message: 'User updated successfully.', user: updatedUser });
  } else {
    res.status(404).json({ message: 'User not found or failed to update.' });
  }
});

app.get('/auth/all', (req, res) => {
  const dataFilePath = path.join(__dirname, 'auth.json');
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.set('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

// Endpoint to handle user sign-in
app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body;
  // Load existing users from data.json
  const dataFilePath = path.join(__dirname, 'data.json');

  try {
    // Check if the file exists
    fs.accessSync(dataFilePath, fs.constants.R_OK);

    const rawData = fs.readFileSync(dataFilePath);
    const data = JSON.parse(rawData);

    // Check if the "users" array exists in data.json
    if (data.users && Array.isArray(data.users)) {
      // Check if the user with the provided email and password exists
      const user = data.users.find(u => u.email === email && u.password === password);

      if (user) {
        console.log('User Sign-In:', user);
        res.json({ message: 'Sign-in successful.', user });
      } else {
        res.status(401).json({ message: 'Invalid credentials.' });
      }
    } else {
      res.status(500).json({ message: 'Invalid data file format.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error reading data file.' });
  }
});

app.post('/auth/signup', (req, res) => {
  const newUser = req.body;
  console.log(newUser);
  // Load existing users from data.json
  const dataFilePath = path.join(__dirname, 'data.json');

  try {
    // Check if the file exists
    fs.accessSync(dataFilePath, fs.constants.R_OK);

    const rawData = fs.readFileSync(dataFilePath);
    const data = JSON.parse(rawData);

    // Check if the "users" array exists in data.json
    if (data.users && Array.isArray(data.users)) {
      // Check if the user with the provided email already exists
      const existingUser = data.users.find(u => u.email === newUser.email);

      if (existingUser) {
        res.status(409).json({ message: 'User with this email already exists.' });
      } else {
        // Add the new user to the "users" array
        data.users.push(newUser);

        // Save the updated data back to data.json
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        console.log('New User Signed Up:', newUser);
        res.json({ message: 'Sign-up successful.', user: newUser });
      }
    } else {
      res.status(500).json({ message: 'Invalid data file format.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error reading or writing data file.' });
  }
});


app.get('/data/all', (req, res) => {
  const dataFilePath = path.join(__dirname, 'data.json');
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.set('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

app.get('/data/issue/:issueId', (req, res) => {
  const issueId = req.params.issueId;
  const dataFilePath = path.join(__dirname, 'data.json');

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const jsonData = JSON.parse(data);
      const issues = jsonData.issues || [];

      // Find the user with the specified email
      const issue = issues.find(u => u.id === issueId);

      if (issue) {

        res.set('Content-Type', 'application/json');
        res.send(issue);
      } else {
        res.status(404).json({ message: 'Issue not found.' });
      }
    }
  });
});

// Endpoint to delete an issue by ID
app.delete('/data/delete/:id', (req, res) => {
  const issueId = req.params.id;

  // Call the deleteIssueFromData function to delete the issue from data.json
  deleteIssueFromData(issueId);

  res.json({ message: `Issue with ID ${issueId} deleted successfully.` });
});

// Endpoint to delete a commebt in an issue by ID
app.delete('/data/delete/:idissue/:idcomment', (req, res) => {
  const issueId = req.params.idissue;
  const commentId = req.params.idcomment;

  // Call the deleteCommentFromIssue function to delete the comment from data.json
  deleteCommentFromIssue(issueId, commentId);

  res.json({ message: `Comment with ID ${commentId} in Issue ID ${issueId} deleted successfully.` });
});

// Endpoint to update an issue
app.put('/data/update/issue', (req, res) => {
  const updatedIssue = req.body;
  updateIssueInData(updatedIssue);
  res.json({ message: 'Issue updated successfully.' });
});

// Endpoint to update an issue comment
app.put('/data/update/issue/comment', (req, res) => {
  const { issueId, comment } = req.body;
  updateIssueCommentInData(issueId, comment);
  res.json({ message: 'Issue comment updated successfully.' });
});

app.post('/data/auth/:email/update-picture', upload.single('profilePicture'), (req, res) => {
  const userEmail = req.params.email;
  const imagePath = path.basename(req.file.path);

  // Load existing data from data.json
  const dataFilePath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataFilePath);
  let data = JSON.parse(rawData);

  // Find the user with the specified email
  const userToUpdate = data.users.find(u => u.email === userEmail);
  if (userToUpdate) {
    // Update the user's avatarUrl
    userToUpdate.avatarUrl = `assets/avatars/${imagePath}`;

    // Save the updated data back to data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

    res.json({ message: 'Profile picture updated successfully.', imagePath });
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


