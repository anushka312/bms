const express = require("express");
const app = express(); //It's like creating your server. This app object is how you define routes, middleware, etc.
const cors = require('cors'); //CORS is needed when your frontend and backend are on different domains or ports 
const pool = require('./db');

//middleware
app.use(cors());
app.use(express.json()); //It lets you read req.body as a JavaScript object when a client sends JSON

// ROUTES
const customerRoutes = require('./routes/customer');
app.use('/customers', customerRoutes);

const accountRoutes = require('./routes/account');
app.use('/accounts', accountRoutes);

const borrowerRoutes = require('./routes/borrower');
app.use('/borrower', borrowerRoutes);

const branchRoutes = require('./routes/branch');
app.use('/branch', branchRoutes);

const custBankerRoutes = require('./routes/custbanker');
app.use('/custbanker', custBankerRoutes);

const dependentRoutes = require('./routes/dependent');
app.use('/dependent', dependentRoutes);

const depositorRoutes = require('./routes/depositor');
app.use('/depositor', depositorRoutes);

const employeeRoutes = require('./routes/employee');
app.use('/employee', employeeRoutes);

const loanRoutes = require('./routes/loan');
app.use('/loan', loanRoutes);

const otherRoutes = require('./routes/other');
app.use('/other', otherRoutes);

app.listen(5000, ()=>{
    console.log("server has started on port 5000");
});


