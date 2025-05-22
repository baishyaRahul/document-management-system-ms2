require('dotenv').config();
const {
    File: fileModel,
    Folder: folderModel,
} = require("../models");
const path = require('path');

const createFolder = async (req, res) => {

    try {
        const { name, type, maxFileLimit } = req.body;
        const folderData = await folderModel.create({ name, type, maxFileLimit });
        res.status(201).json({ message: 'Folder created successfully.', folder: folderData });
    }
    catch (error) { console.error(error) }
}

const updateFolder = async (req, res) => {

    try {
        const folderId = req.params.folderId;
        const { name, type, maxFileLimit } = req.body;
        const [updatedFolder] = await folderModel.update(
            { name, type, maxFileLimit },
            { where: { folderId: folderId } }
        );
        if (updatedFolder > 0) {
            res.status(201).json({ message: 'Folder updated successfully' });
        }
    }
    catch (error) { console.error(error) }
}

const deleteFolder = async (req, res) => {
    try {
        const folderId = req.params.folderId;

        const deleteFolder = await folderModel.destroy({
            where: { folderId: folderId }
        });

        if (deleteFolder) {
            res.status(200).json({ message: "Folder deleted successfully." });
        } else {
            res.status(404).json({ message: "Folder not found." });
        }
    } catch (error) {
        console.error(error);
    }
};


const uploadFile = async (req, res) => {
    try {
        const folder = await folderModel.findByPk(req.params.folderId);
        if (!folder) return res.status(404).json({ error: 'Folder not found' });

        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const fileExt = path.extname(file.originalname).slice(1).toLowerCase();

        if (fileExt !== folder.type.toLowerCase()) {
            return res.status(400).json({ error: `File type must be ${folder.allowedFileType}` });
        }

        const fileCount = await fileModel.count({ where: { folderId: folder.folderId } });
        if (fileCount >= folder.maxFileLimit) {
            return res.status(400).json({ error: 'Max file limit reached' });
        }

        const newFile = await fileModel.create({
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: file.path,
            folderId: folder.folderId,
            description: req.body.description || '',
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                fileId: newFile.fileId,
                uploadedAt: newFile.uploadedAt,
                name: newFile.name,
                type: newFile.type,
                size: newFile.size,
                folderId: newFile.folderId,
                description: newFile.description,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

module.exports = {
    createFolder,
    updateFolder,
    deleteFolder,
    uploadFile
};