var helper = {};
//const Question = require("../models/problems");
//const TC = require("../models/testcases");
//const total = require("../models/total_questions");
//const contests = require("../models/contests");
const users = require("../models/users");
var moment = require("moment");





/**Display the page for managing the admins 
 * route: /admin/manage-admins
*/
helper.getManageAdmins = async (req, res, next) => {
    /**Finding all the users who are admins also */
    users.find({ isAdmin: true })
        .then((data) => {
            console.log(data);
            res.render("manage_admins", { data: data });
        })
        .catch((err) => {
            console.log(err);
        })
}

/**POST: adding a new admin 
 * route: /admin/add-admin
*/
helper.addAdmin = async (req, res, next) => {
    /**Taking input from the html form */
    const adminUsername = req.body.username;
    /**Finding the entry of that username in the users collection */
    users.findOne({ username: adminUsername })
        .then((data) => {
            console.log(data);
            /**No user found with username = adminUsername */
            if (!data) {
                return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-does-not-exists");
            }
            /**If the username is already the admin */
            if (data.isAdmin) {
                return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-is-already-an-admin");
            }
            /**Else add that username as an admin */
            users.findOneAndUpdate({ username: adminUsername }, { $set: { isAdmin: 1 } })
                .then((result) => {
                    console.log("ADMIN ADDED: " + result);
                    return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-added-successfully");
                })
        })
        .catch((err) => {
            console.log(err);
        })
}

/**POST: removing an admin 
 * route: /admin/remove-admin
*/
helper.removeAdmin = async (req, res, next) => {
    /**Taking input from the html form */
    const adminUsername = req.body.username;
    /**Finding the entry of that username in the users collection */
    users.findOne({ username: adminUsername })
        .then((data) => {
            console.log(data);
            /**No user found with username = adminUsername */
            if (!data) {
                return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-does-not-exists");
            }
            /**If the username is not an admin */
            if (!data.isAdmin) {
                return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-is-not-an-admin");
            }
            /**Don't allow the admin to remove himself */
            if (adminUsername === res.locals.user.username) {
                return res.redirect("/admin/manage-admins?msg=You-cannot-remove-yourself");
            }
            /**Else remove that username from the admin */
            users.findOneAndUpdate({ username: adminUsername }, { $set: { isAdmin: 0 } })
                .then((result) => {
                    console.log("REMOVED ADMIN: " + result);
                    return res.redirect("/admin/manage-admins?msg=Username-" + adminUsername + "-removed-successfully");
                })
        })
        .catch((err) => {
            console.log(err);
        })
}

module.exports = helper;
