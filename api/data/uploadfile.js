const express = require('express');
const router = express.Router();
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const currentDatetime = moment();
const dateTime = currentDatetime.format('YYYY-MM-DD HH:mm:ss');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/docfile');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `file-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage: storage });

router.post('/create', upload.array('files'), async (req, res) => {
  const { contract_code_fk } = req.body;
  const files = req.files;

  if (!files || !contract_code_fk) {
    return res.status(400).send('Missing required data');
  }

  try {
    // Insert file data into SQL
    for (const file of files) {
      const fieldfile = 'contract_code_fk,file_insurance,create_date';
      const datafile = [contract_code_fk, file.filename, dateTime]; // Use file.filename to get the saved file name with timestamp

      await new Promise((resolve, reject) => {
        db.insertData('oac_doc_insurance', fieldfile, datafile, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    return res.status(200).json({ message: `ການບັນທຶກຂໍ້ມູນສ້ຳເລັດ` });
  } catch (error) {
    console.error('Error inserting data into SQL:', error);
    return res.status(500).send('Server error');
  }
});


router.delete("/:id", function (req, res) {
  const fileId = req.params.id;
  const where = `file_doc_id=${fileId}`;
  db.fetchSingle('oac_doc_insurance', '*', where, (err, results) => {
    const filePath = path.join('assets/docfile/', results.file_insurance);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting the existing file:', err);
      }
    });
    db.deleteData('oac_doc_insurance', where, (err, results) => {
      if (err) {
        console.error('Error doc insurance data:', err);
        return res.status(500).json({ error: 'ການບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ' });
      }
      res.status(200).json({ message: 'ການລົບຂໍ້ມູນບໍ່ສຳເລັດ' });
    });
  })
})

router.post('/delmt', function (req, res) {
  const { fileData } = req.body;
  const deletePromises = fileData.map(item => {
    return new Promise((resolve, reject) => {
      const where = `file_doc_id=${item.file_doc_id}`; 
      const filePath = path.join('assets/docfile/', item.file_insurance);
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err); // Reject if there's an error deleting the file
        } else {
          // Delete corresponding data from database
          db.deleteData('oac_doc_insurance', where, (err, results) => {
            if (err) {
              reject(err); // Reject if there's an error deleting data from the database
            } else {
              resolve(results); // Resolve if deletion is successful
            }
          });
        }
      });
    });
  });

  Promise.all(deletePromises)
    .then(results => {
      res.status(200).json({ message: 'ການລົບຂໍ້ມູນໄດ້ສຳເລັດ' });
    })
    .catch(err => {
      console.error(fileData);
      res.status(500).json({ message: 'ການແຊກຂໍ້ມູນລົ້ມເຫລວ' });
    });
});


module.exports = router;
