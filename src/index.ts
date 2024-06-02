import mysql, { RowDataPacket } from "mysql2";
import { Employee } from "./models/employee";
import http from "http";
import fs from "fs";
import path from "path";

let connected = false;

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "labasrytas",
    database: "employees",
    port: 3305
});


con.connect((error: any) => {
    if (error) throw error;

    connected = true;
});


const server = http.createServer((req,res) => {
    
    const url = req.url;
    const method = req.method;

    let filePath = `public${url}`;

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const ext = path.extname(filePath);

        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        }

        let file = fs.readFileSync(filePath);
        res.write(file);
        return res.end();
    }

    if (url=="/") {
            con.query<Employee[]>("SELECT * FROM employees", (error,result)=> {
                if (error) throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows = "";
                result.forEach((e) => {
                    rows += "<tr>";
                    rows += `<td>${e.name}</td><td>${e.surname}</td><td><a href="/employees/${e.id}" class="btn btn-sm btn-info">Informacija</a></td>`;
                    rows += "</tr>";
                });
                let template = fs.readFileSync("templates/index.html").toString();
                template = template.replace("{{ employee_table }}", rows);
                res.write(template);
                res.end();
            });
        }


    if (url?.split("/")[1] == "employees") {

        let id = parseInt(url?.split("/")[2]);
        
            con.query<Employee[]>(`SELECT * FROM employees WHERE id=${id}`, (error,result)=> {
                if (error) throw error;
                
                let employee = result[0];
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                
                let template = fs.readFileSync("templates/employee.html").toString();
                template = template.replace("{{ name }}", employee.name);
                template = template.replace("{{ surname }}", employee.surname);
                template = template.replace("{{ gender }}", employee.gender != null? employee.gender : "-");
                template = template.replace("{{ phone }}", employee.phone != null? employee.phone : "-");
                template = template.replace("{{ birthday }}", employee.birthday != null? employee.birthday.toLocaleDateString() : "-");
                template = template.replace("{{ education }}", employee.education != null? employee.education : "-");
                template = template.replace("{{ salary }}", employee.salary != null? employee.salary.toString() : "-");
                
                res.write(template);
                res.end();
            });
    }

});

server.listen(2995, "localhost");
