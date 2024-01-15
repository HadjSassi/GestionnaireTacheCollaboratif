const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // Replace with the actual origin of your Angular app
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Include DELETE method
  next();
});

app.use(bodyParser.json());

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
        body: comment.body,
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
        body: comment.body,
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


app.get('/auth/all', (req, res) => {
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


// Endpoint to handle user sign-in
app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  console.log(password);
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



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
