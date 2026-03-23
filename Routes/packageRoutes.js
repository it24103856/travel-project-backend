import express from "express";
import { createPackage, getAllPackages } from "../controllers/packageController.js";


const router = express.Router();

router.post("/", createPackage); 

router.get("/all", getAllPackages);

export default router;