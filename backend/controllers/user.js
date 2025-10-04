import { registerSchema } from "../config/zod.js";
import trycatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
export const registerUser = trycatch(async (req, res) => {
    const sanitizedBody=sanitize(req.body);
    const validation=registerSchema.safeParse(sanitizedBody);
    if(!validation.success){
        const zodError=validation.error;
        let firstErrorMessage= "Validation failed"
        let allErrors=[]
        if(zodError?.issues && Array.isArray(zodError.issues)){
            allErrors=zodError.issues.map((issue)=>({
                field:issue.path?issue.path.join("."):"unknown",message:issue.message||"Validation Error",
                code:issue.code,
            }))
            firstErrorMessage=allErrors[0]?.message||"Validation Error"
        }
        return res.status(400).json({message:firstErrorMessage,
            errors:allErrors,
        })
    }
    const {name,email,password}=validation.data;
    
    res.json({name,email,password})
})