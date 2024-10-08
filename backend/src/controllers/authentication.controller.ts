import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


interface userBody {
    id: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

async function Register(req: Request, res: Response) {
    try {
        const data: userBody = req.body;
        const newUser = new User;

        newUser.name = data.name;
        newUser.email = data.email;
        newUser.isAdmin = data.isAdmin;
        newUser.isSuperAdmin = data.isSuperAdmin;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        newUser.password = hashedPassword;

        if (newUser != null) {
            await AppDataSource.manager.save(newUser);
            return res.sendStatus(201);
        }
        else {
            return res.sendStatus(400);
        }
    } catch (error) {
        console.log(error)
    }

}

const secretKey = process.env.BACK_SECRET || "meianoiteeuteconto";

async function Login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await AppDataSource.manager.findOneBy(User, { email: email });

        const salt = await bcrypt.genSalt(10);
        
        if (bcrypt.compare(password, salt)) {
            const token = jwt.sign({ userId: user.email }, secretKey, { expiresIn: '1h' });
            return res.status(200).send({ token });
        }
        else {
            return res.sendStatus(401)
        }
    } catch (error) {
        console.log(error);
    }
}

export { Register, Login };