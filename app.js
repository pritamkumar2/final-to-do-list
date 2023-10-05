// import neccessary npm module and run express
import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
const app = express();
const port = process.env.port || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ///////////////////////////

// conection for mongodb and create an db
const uri = "mongodb+srv://pritam:pritam123@cluster0.hyz2ftj.mongodb.net/app?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
/////////////////////////

// creating a schema to create format of collection
const itemList = new mongoose.Schema({
  name: String,
});

/////create a collection
const product = new mongoose.model("Item", itemList);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemList],
});
const list = new mongoose.model("List", listSchema);

const item1 = product({
  name: "want personal task use(/your name) at the end of url",
});

const item2 = product({
  name: "Hit the Add button to add a new item.",
});

const item3 = product({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

// /////////

// array to find week month day etc
const weeks = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const yearMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let days = new Date();
const year = days.getFullYear();
const month = yearMonths[days.getMonth()];
const day = days.getDay();
const today = weeks[day];

/////////////////////////////////////
// create an route and endpoint

app.get("/:path", async (req, res) => {
  const userId = req.params.path;

  let data = await list.findOne({ name: userId }).exec();

  if (!data) {
    // Create a new document and immediately capture it
    data = await list.create({ name: userId, items: defaultItems });
    console.log(data, "<-------------- new document created"); // Log the created document
  }

  res.render("../view/index.ejs", {
    day: today,
    month: month,
    year: year,
    newLiItems: data.items, // Use data.items to render items
    userId: userId,
  });
});

app.get("/", async (req, res) => {
  try {
    // Fetch the list data from the database
    const data = await product.find();
    // send file to index.ejs
    res.render("../view/index.ejs", {
      day: today,
      month: month,
      year: year,
      newLiItems: data,
    });
    /////////////
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

////////////////////////

///////getting data form the form
app.post("/", async (req, res) => {
  let newTask = req.body.newItem;
  const newUser = req.body.userId;
  console.log(newTask, newUser);

  const trimmedString = newTask.trim();

  if (trimmedString === "") {
    // If the trimmed string is empty, log a message
    console.log("String is empty");
    res.redirect("/");
  } else {
    try {
      if (!newUser) {
        // Insert the new item into the database for the home route
        await product.create({ name: newTask });
        const updatedData = await product.find();
        console.log(updatedData);

        // Redirect to the home route
        res.redirect("/");
      } else {
        // Finding and updating the user data
        let data = await list
          .findOneAndUpdate(
            { name: newUser },
            { $push: { items: { name: newTask } } }
          )
          .exec();
        const updated = await list.findOne({ name: newUser }).exec();
        console.log(
          updated,
          "<----------------------------form coming data got caught"
        );

        // Redirect to the user-specific route (e.g., /pritam)
        res.redirect("/" + newUser);
      }
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
});

// delete the list items
// delete the list items
app.post("/delete", async (req, res) => {
  const check = req.body.checker;
  const listName = req.body.checkerId;
  console.log(check, listName, "<----------------------saleee last kam");
  try {
    if (!listName) {
      // Use findOneAndDelete to find and delete the object by name
      const deletedItem = await product.findOneAndDelete({ name: check });
      const updatedData = await product.find();
      console.log(updatedData);
      // Redirect to the home route
      console.log("i am here buddy");
      res.redirect("/");
    } else {
      console.log("i am romming here buddy");
      // Finding and updating the user data using async/await
      const data = await list.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { name: check } } },
        { new: true } // Add { new: true } to get the updated document
      );
      // Redirect to the user-specific route (e.g., /pritam)
      res.redirect("/" + listName);
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// running the server on port 3000
app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`);
});
 