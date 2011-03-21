## (P)hono :: (C)oucdhDB :: (N)ode :: (A)sterisk :: Remote Agent Solution

A complete remote agent / remote call center solutiom built with JavaScript. This solutoon uses:

* Asterisk - The open source telephony platform (http://asterisk.org).
* Node.js - Server-side JavaScript framework (http://nodejs.org).
* CouchBase - Document oriented database (http://couchbase.com).
* Phono - jQuery plugin for building cbrowser-based communication apps (http://phono.com).

## Deploying this app

CouchApps are web applications which can be served directly from [CouchDB](http://couchdb.apache.org). This gives them the nice property of replicating just like any other data stored in CouchDB. They are also simple to write as they can use the built-in jQuery libraries and plugins that ship with CouchDB.

[More info about CouchApps here.](http://couchapp.org)

Assuming you just cloned this app from git, and you have changed into the app directory in your terminal, you want to push it to your CouchDB with the CouchApp command line tool, like this:

    couchapp push . http://name:password@hostname:5984/mydatabase

If you don't have a password on your CouchDB (admin party) you can do it like this (but it's a bad, idea, set a password):

    couchapp push . http://hostname:5984/mydatabase

If you get sick of typing the URL, you should setup a `.couchapprc` file in the root of your directory. Remember not to check this into version control as it will have passwords in it.

The `.couchapprc` file should have contents like this:

    {
      "env" : {
        "public" : {
          "db" : "http://name:pass@mycouch.couchone.com/mydatabase"
        },
        "default" : {
          "db" : "http://name:pass@localhost:5984/mydatabase"
        }
      }
    }

Now that you have the `.couchapprc` file set up, you can push your app to the CouchDB as simply as:

    couchapp push

This pushes to the `default` as specified. To push to the `public` you'd run:

    couchapp push public

Of course you can continue to add more deployment targets as you see fit, and give them whatever names you like.
