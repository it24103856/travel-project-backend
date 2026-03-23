import Package from "../models/Package.js";

// Create a new Package
export const createPackage = async (req, res) => {
    try {
        // Frontend එකෙන් එවන සියලුම දත්ත req.body හරහා ලබා ගැනීම
        const newPackage = new Package(req.body);

        // Database එකේ Save කිරීම
        const savedPackage = await newPackage.save();

        res.status(201).json({ 
            success: true, 
            message: "පැකේජය සාර්ථකව නිර්මාණය කළා!", 
            data: savedPackage 
        });
    } catch (error) {
        console.error("Package Creation Error: ", error);
        res.status(500).json({ 
            success: false, 
            message: "පැකේජය සුරැකීමට අපහසු විය.", 
            error: error.message 
        });
    }
};

// අනාගත ප්‍රයෝජනය සඳහා: Get all Packages
export const getAllPackages = async (req, res) => {
    try {
        // packages ගන්නා විට ඊට අදාළ hotel සහ driver දත්තද (populate) ලබා ගනී
        const packages = await Package.find()
            .populate("hotels", "name city") 
            .populate("driver", "name vehicleType phone");

        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        res.status(500).json({ success: false, message: "දත්ත ලබා ගැනීමට අපහසුයි." });
    }
};