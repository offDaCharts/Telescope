Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId);
});
Meteor.publish('allUsers', function() {
  if (this.userId && isAdminById(this.userId)) {
    // if user is admin, publish all fields
    return Meteor.users.find();
  }else{
    // else, filter out sensitive info
    return Meteor.users.find({}, {fields: {
      secret_id: false,
      isAdmin: false,
      emails: false,
      notifications: false,
      'profile.email': false,
      'services.twitter.accessToken': false,
      'services.twitter.accessTokenSecret': false,
      'services.twitter.id': false,
      'services.password': false
    }});
  }
});

Meteor.startup(function(){
  Meteor.users.allow({
      insert: function(userId, doc){
        //TODO
        return true;
      }
    , update: function(userId, docs, fields, modifier){
      // console.log("updating");
      // console.log(userId);
      // console.log(docs);
      // console.log('fields: '+fields);
      // console.log(modifier); //uncommenting this crashes everything
      if(isAdminById(userId) || (docs[0]._id && docs[0]._id==userId)){
          return true;
        }
        return false;
      }
    , remove: function(userId, docs){ 
        if(isAdminById(userId) || (docs[0]._id && docs[0]._id==userId)){
          return true;
        }
        return false; 
      }
  });
});

// Posts

Posts = new Meteor.Collection('posts');
// Meteor.publish('posts', function() {
//   return Posts.find({}, {sort: {score: -1}});
// });

Meteor.publish('posts', function(find, options, subName) {
  var collection=Posts.find(find, options);
  var collectionArray=collection.fetch();

  // if this is a single post subscription but no post ID is passed, just return an empty collection
  if(subName==="singlePost" && _.isEmpty(find)){
    collection=null;
    collectionArray=[];
  }

  // console.log("publishing :"+subName);
  // console.log(find, options.sort, options.skip, options.limit);
  // console.log('collection.fetch().length '+collectionArray.length);
  // for(i=0;i<collectionArray.length;i++){
  //   console.log('- '+collectionArray[i].headline);
  // }
  // console.log('\n');

  return collection;
});

// a single post, identified by id
Meteor.publish('post', function(id) {
  return Posts.find(id);
});

// FIXME -- check all docs, not just the first one.
Meteor.startup(function(){
  Posts.allow({
      insert: function(userId, doc){
        if(userId){
          doc.userId = userId;
          return true;
        }
        return false;
      }
    , update: function(userId, docs, fields, modifier){ 
        if(isAdminById(userId) || (docs[0].userId && docs[0].userId===userId)){
          return true;
        }
        throw new Meteor.Error(403, 'You do not have permission to edit this post');
        return false;
      }
    , remove: function(userId, docs){ 
        if(isAdminById(userId) || (docs[0].userId && docs[0].userId===userId)){
          return true;
        }
        throw new Meteor.Error(403, 'You do not have permission to delete this post');
        return false; }
  });
});

// Comments

Comments = new Meteor.Collection('comments');

Meteor.publish('comments', function(query) {
  return Comments.find(query);
});

Meteor.startup(function(){
  Comments.allow({
      insert: function(userId, doc){
        if(userId){
          return true;
        }
        return false;
      }
    , update: function(userId, docs, fields, modifier){
        if(isAdminById(userId) || (docs[0].userId && docs[0].userId==userId)){
          return true;
        }
        throw new Meteor.Error(403, 'You do not have permission to edit this comment');        
        return false;
      }
    , remove: function(userId, docs){ 
        if(isAdminById(userId) || (docs[0].userId && docs[0].userId==userId)){
          return true;
        throw new Meteor.Error(403, 'You do not have permission to delete this comment');
        }
        return false;
      }
  });
});

// Settings

Settings = new Meteor.Collection('settings');

Meteor.publish('settings', function() {
  return Settings.find();
});

Meteor.startup(function(){
  Settings.allow({
      insert: function(userId, docs){ return isAdminById(userId); }
    , update: function(userId, docs, fields, modifier){ return isAdminById(userId); }
    , remove: function(userId, docs){ return isAdminById(userId); }
  });
});


// Notifications

Notifications = new Meteor.Collection('notifications');

Meteor.publish('notifications', function() {
  // only publish notifications belonging to the current user
  return Notifications.find({userId:this.userId});
});

Meteor.startup(function(){
  Notifications.allow({
      insert: function(userId, doc){
        if(userId){
          return true;
        }
        return false;
      }
    , update: function(userId, docs, fields, modifier){
        if(isAdminById(userId) || (docs[0].user_id && docs[0].user_id==userId)){
          return true;
        }
        return false;
      }
    , remove: function(userId, docs){ 
        if(isAdminById(userId) || (docs[0].user_id && docs[0].user_id==userId)){
          return true;
        }
        return false;
      }
  });
});

// Categories

Categories = new Meteor.Collection('categories');

Meteor.publish('categories', function() {
  return Categories.find();
});

Meteor.startup(function(){
  Categories.allow({
      insert: function(userId, docs){ return isAdminById(userId); }
    , update: function(userId, docs, fields, modifier){ return isAdminById(userId); }
    , remove: function(userId, docs){ return isAdminById(userId); }
  });
});