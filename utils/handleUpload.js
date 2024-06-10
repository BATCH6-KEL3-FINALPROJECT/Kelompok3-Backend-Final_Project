// const imagekit = require('../libs/imageKit.js');
const ImageKit = require("../lib/imagekit");

const handleUploadImage = async (files, folder) => {
	let imagesUrl = [];
	let imagesId = [];

	await Promise.all(
		files.map(async (file) => {
			const split = file.originalname.split('.');
			const extension = split[split.length - 1];

			const uploadedImage = await ImageKit.upload({
				file: file.buffer,
				fileName: `user-${Date.now()}.${extension}`,
				folder: `finalProject/${folder}`
			});

			imagesUrl.push(uploadedImage.url);
			imagesId.push(uploadedImage.fileId);
		})
	);

	return { imagesUrl, imagesId };
};

module.exports = handleUploadImage;