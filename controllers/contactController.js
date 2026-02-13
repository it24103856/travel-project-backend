import Contact from "../models/Contact.js";
import Message from "../models/Message.js";

export const createContact=async(req,res)=>{
    try {
        const {
            name,
            email,
            phone,
            address
           
        }=req.body;
             // Check if contact with the same email already exists
        const exitingContact=await Contact.findOne({email:email});
        if(exitingContact){
            return res.status(400).json({message:"Contact with this email already exists"})
        }
        const newContact=new Contact({
            name,
            email,
            phone,
            address
     
        })
        const savedContact=await newContact.save();
        res.status(201).json({message:"contact create suceesfully",data:savedContact});
    } catch (error) {
        res.status(500).json({message:"Create failed",error:error.message})
    }
}

export const getContct=async(req,res)=>{
    try{
        const contact=await Contact.findOne();// first contact record eka aran gann eka
        if(!contact){
            return res.status(404).json({message:"Contact not found"})
        }
        res.status(200).json({message:"Contact fetched successfully",data:contact})
    } catch (error) {
        res.status(500).json({message:"Failed to fetch contact",error:error.message})
    }
}

export const updateContact=async(req,res)=>{
    try{
        const {
            name,
            email,
            phone,
            address
        }=req.body;
        const updateContact=await Contact.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                phone,
                address
            },
            { new: true , runValidators: true } // update karapu record eka return karanna memethod eka use karanawa
        );
        if(!updateContact){
            return res.status(404).json({message:"Contact not found"})
        }
        res.status(200).json({message:"Contact updated successfully",data:updateContact})
    }
    catch (error) {
        res.status(500).json({message:"Failed to update contact",error:error.message})
    }
}

export const deleteContact=async(req,res)=>{
    try{
        const deleteContact=await Contact.findByIdAndDelete(req.params.id);
        if(!deleteContact){
            return res.status(404).json({message:"Contact not found"})
        }
        res.status(200).json({message:"Contact deleted successfully"})


    } catch (error) {
        res.status(500).json({message:"Failed to delete contact",error:error.message})
    }
}

// create message customer 
export const sendMessage = async (req, res) => {
    try {
        const { customerName, customerEmail, subject, message } = req.body;
        
        const newMessage = new Message({
            customerName,
            customerEmail,
            subject,
            message
        });

        await newMessage.save();
        res.status(200).json({ message: "Message sent successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to send message", error: error.message });
    }
};

//get message admin only

export const getAllMessage = async (req, res) => { // Mehi (req, res) wenas kara
    try {
        // Aluthma message tika udata ena widiyata sort kara
        const messages = await Message.find().sort({ createdAt: -1 }); 
        
        res.status(200).json({ data: messages }); // Status spelling haduna
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try{
        const messageId=req.params.id;
        const deletedMessage=await Message.findByIdAndDelete(messageId);
        if(!deletedMessage){
            return res.status(404).json({message:"Message not found"});
        }
        res.status(200).json({message:"Message deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Failed to delete message",error:error.message});
    }
}