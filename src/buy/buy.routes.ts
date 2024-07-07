import express, { response } from "express";
import bodyParser from "body-parser"; // Import the body-parser package
import * as database from "./buy.database";
export const buyRouter = express.Router();

buyRouter.use(bodyParser.json());

buyRouter.get("/buy", (req, res) => {
	console.log("Buy route");
	res.send("Buy route");
});

buyRouter.post("/buy", async (req, res) => {
	const { id, walletId } = req.body;
	try {
		if (!id || !walletId) {
			return res
				.status(400)
				.json({ error: `Please provide all the required parameters..` });
		}
		const response = await database.createBuy(req.body);
		if (response !== null) {
			res.status(200).json(response);
		} else {
			res.status(400).json({ success: false, message: "Failed to create buy" });
		}
	} catch (error) {
		return res.status(500).json({ error });
	}
});
