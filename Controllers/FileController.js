const multer = require('multer')
const sharp = require('sharp')

const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  const filetypes = /pdf/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  if (!!extname) {
    cb(null, true)
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

const GetImageURL = catchAsync(async (req, res, next) => {
  if (req.files.images[0].filename) {
    res.status(201).json({
      status: 'success',
      message: 'File(s) successfully Uploaded',
      data: {
        URL: `${req.protocol}://${req.get('host')}/file/${
          req.files.files[0].filename
        }.pdf`
      }
    })
  } else {
    next(new AppError('File not found!!', 404))
  }
})

exports.uploadPhoto = upload.fields([{ name: 'images', maxCount: 1 }])
exports.getImageURL = GetImageURL
