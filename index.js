const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 3000

app.use(bodyParser.json())

// Directory to store buckets and objects
const dataDir = path.join(__dirname, "data")

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir)
}

// List all buckets
app.get("/buckets", (req, res) => {
	const buckets = fs.readdirSync(dataDir)
	res.json(buckets)
})

// Create a new bucket
app.post("/buckets/:bucketName", (req, res) => {
	const { bucketName } = req.params
	const bucketPath = path.join(dataDir, bucketName)

	if (!fs.existsSync(bucketPath)) {
		fs.mkdirSync(bucketPath)
		res.status(201).send(`Bucket '${bucketName}' created.`)
	} else {
		res.status(409).send(`Bucket '${bucketName}' already exists.`)
	}
})

// List all objects in a bucket
app.get("/buckets/:bucketName/objects", (req, res) => {
	const { bucketName } = req.params
	const bucketPath = path.join(dataDir, bucketName)

	if (fs.existsSync(bucketPath)) {
		const objects = fs.readdirSync(bucketPath)
		res.json(objects)
	} else {
		res.status(404).send(`Bucket '${bucketName}' not found.`)
	}
})

// Get an object from a bucket
app.get("/buckets/:bucketName/objects/:objectKey", (req, res) => {
	const { bucketName, objectKey } = req.params
	const filePath = path.join(dataDir, bucketName, objectKey)

	if (fs.existsSync(filePath)) {
		const content = fs.readFileSync(filePath, "utf-8")
		res.json({ content })
	} else {
		res.status(404).send(`Object '${objectKey}' not found in bucket '${bucketName}'.`)
	}
})

// Upload an object to a bucket
app.put("/buckets/:bucketName/objects/:objectKey", (req, res) => {
	const { bucketName, objectKey } = req.params
	const { content } = req.body
	const filePath = path.join(dataDir, bucketName, objectKey)

	if (!fs.existsSync(path.join(dataDir, bucketName))) {
		res.status(404).send(`Bucket '${bucketName}' not found.`)
		return
	}

	fs.writeFileSync(filePath, content)
	res.status(200).send(`Object '${objectKey}' uploaded to bucket '${bucketName}'.`)
})

// Delete an object from a bucket
app.delete("/buckets/:bucketName/objects/:objectKey", (req, res) => {
	const { bucketName, objectKey } = req.params
	const filePath = path.join(dataDir, bucketName, objectKey)

	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath)
		res.status(200).send(`Object '${objectKey}' deleted from bucket '${bucketName}'.`)
	} else {
		res.status(404).send(`Object '${objectKey}' not found in bucket '${bucketName}'.`)
	}
})

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})
