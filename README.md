# Front-end seed

## Quick start
All Javascript and style packages are respectively managed by **[npm](https://www.npmjs.com/)** and **[bower](https://bower.io/)**.  

    npm install
    bower install // bower install --allow-root
    gulp
![Home page][1]
[1]: home.jpg =500px

### Add a new Page
open /src/scripts/route.coffee ,add following code to create a new state.

    .state 'module1' 
    ,
      url: 'page1'
      templateUrl: '/modules/page1/index.html'
      controller: 'page1Ctrl'
create your page(coffee,jade,less) in /src/modules/page1

    page1
    ├── index.ctrl.coffee
    ├── index.jade
    └── index.less
          
page1/index.ctrl.coffee:
    
    angular.module 'Seed'
	.classy.controller
	  name: 'page1Ctrl'
	  inject: [
	    '$scope'
	    '$rootScope'
	    '$state'
	  ]
	  initScope: ->
	    hello: 'This is a new page.'
	  data: null
	  init: -> null
	  methods: null
page1/index.jade:

	.page1
	  {{hello}}
page1/index.less:
	
	.page1 {
	  text-align: center;
	}
**Add page1's js file and css file to app**

	src/modules/mod-index.jade:
		script(src='./modules/page1/index.ctrl.js')
	src/modules/mod-styles.less:
		@import "./page1/index";	
	  
use **gulp** to build app, then open **http://localhost:9000/page1** in browser.

---
### View and Controller interaction via Angular

This front-end app is based on AngularJs. All features and functions of Angular are availble to use. See the **[Angular developer API reference](https://code.angularjs.org/1.4.0-rc.1/docs/api)**

**Coding in a simple and efficient way**, CoffeeScript, Jade and LessCSS are employed in this framework as a improved version of Javascript, Html and CSS.

* CoffeeScript <http://coffee-script.org/> 
* Jade <http://jade-lang.com/>
* LessCSS <http://lesscss.org/>

Here is an example:

1.add these code in page1/index.jade:

	.page1
	  p {{hello}}
	  label
	    | Name:
	    input(type='text',ng-model='user.name')
	    button(ng-click='btnFunc()') Button
	  p user.name = {{user.name}}
2.creat btnFunc() for the Button in page1/index.ctrl.coffee:
	
	angular.module 'Seed'
	.classy.controller
	  name: 'page1Ctrl'
	  inject: [
	    '$scope'
	    '$rootScope'
	    '$state'
	  ]
	  initScope: ->
	    hello: 'This is a new page.'
	    user:
	      name: null
	  data: null
	  init: -> null
	  methods:
	    btnFunc: () ->
	      @scope.user.name = 'button clicked.'	  

#### Structure of controller 
Angular Classy are employed to make controllers more structured and prescriptive. See more details on [Angular-classy](http://davej.github.io/angular-classy/).

* **name** : Controller unique name.
* **inject** : An array of all dependencies.	      
* **initScope** : All data present in the view layer [Not required]
* **data** : All data cached in controller 
* **init** : An init method for your initialization code.
* **methods** :  Controller methods are defined inside of the methods object.
	  


