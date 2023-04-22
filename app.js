//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// neeche sab mongoose se mongoDB ke connection ka system hai
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://singhprakhar636:hearmeroar@cluster0.e4amam3.mongodb.net/todolistDB");
    // earlier i was connecting to the local mongoose database, now im using mongoDB atlas
    
    //await mongoose.connect("mongodb://localhost:27017/fruitsDB");
    // this is what we were doing earlier while connecting to our local server
}
// upar sab mongoose wala system hai 

const itemsSchema= new mongoose.Schema({
  name: String
});  // creating our new Schema

const Item= new mongoose.model("Item", itemsSchema);

const task1=new Item({
  name:"Welcome to your To-Do-List App"
});
const task2= new Item({
  name:"Hit the + button to add new items"
});
const task3=new Item({
  name:"<---- Hit this to delete"
});
const kkk=[task1,task2,task3];

const listSchema=new mongoose.Schema({           //custom schema
  name:String,
  items:[itemsSchema]
});
const List=mongoose.model("List", listSchema);   // custom list wala hai ye

const day = date.getDate();             // gets the present date from date.js

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0)
    {
      //Item.insertMany([task1,task2,task3]);
     Item.insertMany(kkk);
      res.redirect("/");
    }
    else
    {
    res.render("list",{listTitle:day, newListItems: foundItems});  
    }
  }); 
});

app.get("/:customListName", function(req,res){    //express routing methods
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(found){
       if(found===null){
       //create a new list
       const list= new List({
        name:customListName,
        items:kkk
      });
      list.save();
      console.log("saved");
      res.redirect("/" + customListName);
       }
       else{
       //show an existing list
       console.log(found.name);
       console.log(found.items);
       res.render("list",{listTitle:found.name, newListItems: found.items});
       }
  })
  .catch(function(err){
    console.log(err);
  });
  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list; 
  // the above stuff were provided to us by the list.ejs submit button and input tag in the form
  const item=new Item({
    name: itemName
  });
  //if(itemName===day)
  if(listName===day)
  {
    item.save(); // this saves our item object in DB without insert command
    res.redirect("/");  
  }
  else
  {
     List.findOne({name:listName})
     .then(function(foundList){
           foundList.items.push(item);
           foundList.save();
           res.redirect("/"+listName);
     })
     .catch(function(err){});
  }  
});

app.post("/delete", function(req,res){
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;
   if(listName===day)
   {
    Item.deleteOne({_id:checkedItemId})
    .then(function(response){
     console.log(response);
    })
    .catch(function(err){
     console.log(err);
    })
    res.redirect("/");
   }  //$pull operator removes from an array all instances of a value that matches a condition
   else // we'll be using $pull inside findOneAndUpdate
   {   // we are pulling from the items array the values which have the id same as given
       // and this is what we are doing for those sets of data which have the same name as
       //listName, i.e., work or school, or office, etc
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
      .then(function(foundList){
       console.log(foundList);
       res.redirect("/"+listName);
      })
      .catch(function(err){
        console.log(err);
      });
   }  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
