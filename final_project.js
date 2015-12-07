Items = new Mongo.Collection("items");
Found_items = new Mongo.Collection("found_items");

Router.configure({layoutTemplate: 'layout'});
Router.route('home', {path: '/'}); // Add this route
Router.route('about', {path: '/about'});

if (Meteor.isClient) {
  // This code only runs on the client
  Template.home.helpers({
    items: function () {
      return Items.find({});
    },
    found_items: function () {
      return Found_items.find({});
    },
    priceSum: function(){

      var userItems = Found_items.find({
        userId: this._id
      }).fetch();

      var prices = _.pluck(userItems, "price");

      var totalTaxed = _.reduce(prices, function(sum, price){
        var total = sum + parseFloat(price);
        return total + (total * 0.04712);
      }, 0);

      return totalTaxed.toFixed(2);
    },
    calcTax: function () {
      var userItems = Found_items.find({
        userId: this._id
      }).fetch();

      var prices = _.pluck(userItems, "price");

      var tax =  _.reduce(prices, function(sum, price){
        return (sum + parseFloat(price)) * 0.04712;
      }, 0);

      return tax.toFixed(2);
    }
  });


  Template.home.events({
    "submit .new-item": function (event) {
      event.preventDefault();

      var text = event.target.text.value;

      Items.insert({
        text: text,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username
      });

      event.target.text.value = "";
    }
  });

  Template.item.events({
    "click .found": function (event, template) {

      event.preventDefault();
      var price = template.find('[name="price"]').value;
      var text = template.find('.text').textContent;

      Items.remove(this._id);
      Found_items.insert({
        text: text,
        price: price,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username
      });

    }
  });


  Template.found.events({
    "click .remove": function(event) {
      event.preventDefault();

      Found_items.remove(this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}