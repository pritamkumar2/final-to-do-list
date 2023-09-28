import express from "express";
import ejs from "ejs";
import mongoose from "mongoose";
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = "mongodb://127.0.0.1/toList";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const itemList = new mongoose.Schema({
  name: String,
});

const product = new mongoose.model("Item", itemList);

app.get("/", async (req, res) => {
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

  try {
    // Fetch the list data from the database
    const data = await product.find();

    res.render("../view/index.ejs", {
      day: today,
      month: month,
      year: year,
      newLiItems: data,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.post("/", async (req, res) => {
  let newTask = req.body.newItem;
  console.log(newTask);

  const trimmedString = newTask.trim();

  if (trimmedString === "") {
    // If the trimmed string is empty, log a message
    console.log("String is empty");
    res.redirect("/");
  } else {
    try {
      // Insert the new item into the database
      await product.create({ name: newTask });

      // Fetch the updated list data from the database
      const updatedData = await product.find();

      // Render the EJS template with the updated data
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

      res.render("../view/index.ejs", {
        day: today,
        month: month,
        year: year,
        newLiItems: updatedData, // Update the template with the new data
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
});

app.post("/delete", async (req, res) => {
  const check = req.body.checker;
  console.log(check , "->the data from form<-");

  try {
    // Use findOneAndDelete to find and delete the object by name
    const deletedItem = await product.findOneAndDelete({ name: check });

    if (!deletedItem) {
      console.log(`Item with name '${check}' not found.`);
    } else {
      console.log(`Item with name '${check}' deleted successfully.`);
    }

    // Fetch the updated list data from the database
    const updatedData = await product.find();

    // Send the updated data to the client
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`);
});
