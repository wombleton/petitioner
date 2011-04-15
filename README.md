Petitioner
============

Petitioner is a simple node.js website to take a list of twitter and facebook signatures on.

Configuration
============

Two files need to be configured:

* `config.js` with the facebook and twitter secrets, session secret, and website title
* `petition.md` with the text of your petition. You can use markdown here.

You will need to install the following node.js modules via npm:

* express
* easy-oauth
* node-markdown

Extracting Signatures
=====================

You can extract the signatures by going to the /download url. This will give you a pdf of the current "signatures" collected.