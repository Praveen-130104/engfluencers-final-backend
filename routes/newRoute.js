import express from "express";

const routerHome = express.Router();

routerHome.get("/", (req, res) => {
    res.send("Server is ready");
    });

export default routerHome;