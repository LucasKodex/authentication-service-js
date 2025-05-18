import bodyParser from "body-parser";
import { Router } from "express";

export const router = Router();

router.use(bodyParser.json());
router.post("/signup", (req, res) => { res.send("{}"); });
router.post("/login", (req, res) => { res.send("{}"); });
router.post("/exchange-refresh-token", (req, res) => { res.send("{}"); });
router.post("/revoke-refresh-token", (req, res) => { res.send("{}"); });
