import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, } from "@aws-sdk/client-s3"
import { Injectable } from "@nestjs/common"

const s3Client = new S3Client({
	region: process.env.s3BucketRegion,
	credentials: {
		accessKeyId: process.env.accessKeyAWS,
		secretAccessKey: process.env.secretKeyAWS,
	},
})

@Injectable()
export class S3DownloadService {
	/**
	 * Function to download file from S3
	 * @param key Path of the file from S3 bucket
	 * @returns
	 */
	async downloadFileFromS3(key: string) {
		const params = {
			Bucket: process.env.s3BucketAWS,
			Key: key,
		}
		try {
			const command = new GetObjectCommand(params)
			const file = await s3Client.send(command)
			const fileBody = file.Body
			const contentType = file.ContentType
			const fileName = this.getFileName(key)
			return { fileBody, contentType, fileName }
		} catch (err) {
			console.error(err)
		}
	}

	async getImageFromS3(key: string) {
		const params = {
			Bucket: process.env.s3BucketAWS,
			Key: key,
		}
		try {
			const command = new GetObjectCommand(params)
			const fileBody = await s3Client.send(command)
			const fileName = this.getFileName(key)
			return { fileBody, fileName }
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Get the name of the file from the path
	 * @param key
	 * @returns
	 */
	private getFileName(key) {
		let fileName = ""
		if (key.indexOf("/") > -1) {
			fileName = key.substring(key.lastIndexOf("/") + 1)
		} else {
			fileName = key
		}
		return fileName
	}

	private initS3() {
		return new S3Client({
			region: process.env.s3BucketRegion,
			credentials: {
				accessKeyId: process.env.accessKeyAWS,
				secretAccessKey: process.env.secretKeyAWS,
			},
		})
	}
	/**
	 * Method to upload a file on S3
	 * @param file - File to be uploaded
	 * @param key - Unique identifier for the file to be stored in S3 bucket in the format - folder_name/file_name
	 * @returns - S3 data
	 */
	async uploadFile(file, key) {
		try {
			const s3Client = this.initS3()
			const bucket = process.env.s3BucketAWS
			const params = {
				Bucket: bucket,
				Key: key,
				Body: file.buffer,
			}
			const command = new PutObjectCommand(params)
			await s3Client.send(command)
			return `s3://${bucket}/${key}`
		} catch (error) {}
	}
}


// list objs
 private async getObjects(s3Client: S3Client, prefix: string) {
        const params = {
            Bucket: process.env.s3BucketAWS,
            Prefix: prefix,
        }
        const commandList = new ListObjectsV2Command(params);
        return await s3Client.send(commandList);

    }

    /**
     * Delete existing Objects from S3 bucket
     * @param s3
     * @param listedObjects
     * @private
     */
    private async deleteObjects(s3Client: S3Client, listedObjects) {
        const params = {
            Bucket: process.env.s3BucketAWS,
            Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach(({ Key }) => {
            params.Delete.Objects.push({ Key });
        });
        const command = new DeleteObjectsCommand(params);
        const response = await s3Client.send(command);

        while (true) {
            if (!listedObjects.IsTruncated) {
                break;
            }
        }
    }
