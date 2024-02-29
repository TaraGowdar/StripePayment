//if script still loading then display DOmContentLoaded and call ready () else ready() will be called
//if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
// } else {
    // ready();
// }

function ready() {
    //setting all button to initial values when page loaded
    var removeCartItemButtons = document.getElementsByClassName('btn-danger');
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button');
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked);
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey, //js key
    locale:'en', //what language to use
    token: function(token){
        // how to respond when strip send us back info
        //after the purchase button is clicked all info is sent to 
        //stripe and stripe verifies it & call this method
       var items = [];
       var cartItemContainer = document.getElementsByClassName('cart-items')[0];
       var cartRows = cartItemContainer.getElementsByClassName('cart-row');
       for(var i =0; i < cartRows.length; i++){
        var cartRow = cartRows [i]; //individual cart row
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        var quantity = quantityElement.value; //how many coffee cups are added etc details
        var id = cartRow.dataset.itemId;
        items.push({
            id:id,
            quantity: quantity
        });
       }
       //fetch method is useful to send info to server
       fetch('/purchase', {
        method: 'POST',
        headers : {//below info telling server that  json info is sent and received
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        //we are fetching to the server
        body: JSON.stringify({
            stripeTokenId: token.id,
            items: items
        })
       }).then (function(res){
        return res.json(); //sent from server as json so covert to json
       }).then(function(data){
        alert(data.message);
        var cartItems = document.getElementsByClassName('cart-items')[0];
        while(cartItems.hasChildNodes()){
            cartItems.removeChild(cartItems.firstChild);
        }
        updateCartTotal();
       }).catch(function(error){
        console.error(error);
       });
    }
    });

function purchaseClicked() {
    //when purchase button is clicked, stripe is called  and stripe is going to call us back and 
    //say ok thats valid & then we can call our server and server is 
    //going to do all checkout info that we need to do
                   
    //total value is got from html page
    var priceElement = document.getElementsByClassName('cart-total-price')[0];
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100; //bcoz price in cents is required by stripe
    stripeHandler.open({
        amount: price
    });
}

function removeCartItem(event) {
    var buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
}

function quantityChanged(event) {
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateCartTotal();
}

function addToCartClicked(event) {
    var button = event.target;
    var shopItem = button.parentElement.parentElement;
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText;
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src; //here pic of item is choosen
    var id = shopItem.dataset.itemId;
    addItemToCart(title, price, imageSrc,id );
    updateCartTotal();
}

function addItemToCart(title, price, imageSrc, id) {
    //first cart row creation is required
    var cartRow = document.createElement('div');
    cartRow.classList.add('cart-row'); //cart row is not yet styled.so it will be added here 
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0];
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title');
    for (var i = 0; i < cartItemNames.length; i++) {
        // duplicate of items should not be added--handled in if section below
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart');
            return;
        }
    }
    //new cart row is created here--so copy from store.html directly  as string in back ticks
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1" autocomplete="off">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
        // innerHtml is used here because HTML tags are used inside of the text
    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem);
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged);
}

function updateCartTotal() {
    // cart-items is an array so need to get the first item is enough
    var cartItemContainer = document.getElementsByClassName('cart-items')[0];
    //cartRows added one by one in for
    var cartRows = cartItemContainer.getElementsByClassName('cart-row');
    var total = 0;
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i];
        var priceElement = cartRow.getElementsByClassName('cart-price')[0];
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        //$9.99 is changed to 9.99 to calculate total and parseFloat will convert 9.99 to float instad of a string
        var price = parseFloat(priceElement.innerText.replace('$', ''));
        var quantity = quantityElement.value;
        total = total + (price * quantity);
    }
    //round the total to the nearest value
    total = Math.round(total * 100) / 100;
    //finally after total 4$ will be added
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total;
}