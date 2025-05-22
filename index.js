require('dotenv').config();

const express = require('express');
const { createFolder, updateFolder, deleteFolder, uploadFile } = require('./controllers/folderFileController.js');
const { upload } = require('./utils/cloudinaryStorage.js'); // adjust path as needed

const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Document Management System (MS2)');
});

app.post('/folder/create', createFolder);
app.put('/folders/:folderId', updateFolder);
app.delete('/folders/:folderId', deleteFolder);

app.post('/folders/:folderId/files', upload.single('file'), uploadFile);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
})