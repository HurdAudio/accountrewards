const api = 'http://technivationtestapi.azurewebsites.net:80/api/';

function accountInfo(element, account) {
  let numberField = document.getElementById('numberField');
  let accountField = document.getElementById('accountField');

  element.addEventListener('click', ()=>{
    numberField.innerHTML = 'Account Number: ' + account.number;
    accountField.innerHTML = account.accountType;
  });
}

function enrollListener(cashBackLabel, cashBackEnroll, cashBackRedeem, account) {
  let numberField = document.getElementById('numberField');
  let accountField = document.getElementById('accountField');
  cashBackEnroll.addEventListener('click', ()=>{
    numberField.innerHTML = '';
    accountField.innerHTML = '';
    let settings = {
      "async": true,
      "crossDomain": true,
      "url": api + account.number +  "/enroll",
      "method": "POST",
      "headers": {
        "Cache-Control": "no-cache"
      },
      "success": function() {
        console.log('success');
        account.rewardsPoints = 0;
        cashBackLabel.innerHTML = 'Cash Back Rewards Program: ' + account.rewardsPoints + ' points';
        cashBackEnroll.setAttribute("style", "visibility: hidden;");
        numberField.innerHTML = account.nickname + ' is now enrolled in Cash Back Rewards';
        accountField.innerHTML = 'Thank you!';
      },
      "failure": function() {
        console.log('fail');
        cashBackLabel.innerHTML = 'Sorry, account not eligible for cash back rewards program';
        cashBackEnroll.setAttribute("style", "visibility: hidden;");
        numberField.innerHTML = 'Sorry, we could not enroll ' + account.nickname + ' in our Cash Back Rewards Program.';
        accountField.innerHTML = '';
      }
    };

    $.ajax(settings).done(function (response) {
      //console.log(response);
    });
  });
}

function redeemListener(cashBackLabel, cashBackEnroll, cashBackRedeem, account) {
  let numberField = document.getElementById('numberField');
  let accountField = document.getElementById('accountField');
  cashBackRedeem.addEventListener('click', ()=>{
    numberField.innerHTML = '';
    accountField.innerHTML = '';
    cashBackRedeem.setAttribute("style", "visibility: hidden;");
    let settings = {
    "async": true,
    "crossDomain": true,
    "url": api + account.number + "/redeem",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    "processData": false,
    "data": "{\n  \"redeemAmount\": \"50\"\n}\n"
    }

    $.ajax(settings).done(function (response) {
      //console.log(response);
      if (parseInt(response) < account.rewardsPoints) {
        account.rewardsPoints = parseInt(response);
      } else {
        account.rewardsPoints -= 50;
      }
      cashBackLabel.innerHTML = 'Cash Back Rewards Program: ' + account.rewardsPoints + ' points';
      if (account.rewardsPoints < 50) {
        cashBackRedeem.setAttribute("style", "visibility: hidden;");
      }
      numberField.innerHTML = '50 Cashback Points Redeemed for ' + account.nickname + ' account.';
      accountField.innerHTML = 'Thank You!';
      cashBackRedeem.setAttribute("style", "visibility: visilble;");
    });
  });

}

function setEventListeners(accounts) {
  let element;
  let cashBackLabel;
  let cashBackEnroll;
  let cashBackRedeem;

  for (let i = 0; i < accounts.length; i++) {
    element = document.getElementById('account' + accounts[i].number);
    accountInfo(element, accounts[i]);
    cashBackLabel = document.getElementById('label' + accounts[i].number);
    cashBackEnroll = document.getElementById('enroll' + accounts[i].number);
    cashBackRedeem = document.getElementById('redeem' + accounts[i].number);
    if (accounts[i].isEligibleForRewards) {
      if (accounts[i].isEnrolledInRewards) {
        if (accounts[i].rewardsPoints > 50) {
          cashBackLabel.innerHTML = 'Cash Back Rewards Program: ' + accounts[i].rewardsPoints + ' points';
          cashBackLabel.setAttribute("style", "visibility: visible;");
          cashBackEnroll.setAttribute("style", "visibility: hidden;");
          cashBackRedeem.setAttribute("style", "visibility: visible;");
          redeemListener(cashBackLabel, cashBackEnroll, cashBackRedeem, accounts[i]);
        } else {
          cashBackLabel.innerHTML = 'Cash Back Rewards Program: ' + accounts[i].rewardsPoints + ' points';
          cashBackLabel.setAttribute("style", "visibility: visible;");
          cashBackEnroll.setAttribute("style", "visibility: hidden;");
          cashBackRedeem.setAttribute("style", "visibility: hidden;");
        }
      } else {
        cashBackLabel.innerHTML = 'Cash Back Rewards Program: enroll today!';
        cashBackLabel.setAttribute("style", "visibility: visible;");
        cashBackEnroll.setAttribute("style", "visibility: visible;");
        cashBackRedeem.setAttribute("style", "visibility: hidden;");
        enrollListener(cashBackLabel, cashBackEnroll, cashBackRedeem, accounts[i]);
      }

    } else {
      cashBackLabel.setAttribute("style", "visibility: hidden;");
      cashBackEnroll.setAttribute("style", "visibility: hidden;");
      cashBackRedeem.setAttribute("style", "visibility: hidden;");
    }
  }
}

function renderUserAccounts(accounts) {

  let userAccountsList = document.getElementById('userAccountsList');

  var RepeatModule = React.createClass({
    getInitialState: function() {
      return(null);
    },
    render: function() {
      let accountItems = accounts.map(item=>{
        return(
          React.createElement('li', { key: item.number, className:'list-group-item'},
            React.createElement('a', {href: "#", className: 'list-group-item list-group-item-action', id: 'account' + item.number},
              React.createElement('p', {}, item.nickname + ' ' + item.maskedNumber),
              React.createElement('p', {}, 'Balance: ' + item.formattedCurrentBalance)
            ),
            React.createElement('p', {id: 'label' + item.number}, 'Cash Back Rewards Program: '),
            React.createElement('div', {className: 'btn-group', role: 'group'},
              React.createElement('button', {id: 'enroll' + item.number, type: 'button', className: 'btn btn-secondary'}, 'enroll'),
              React.createElement('button', {id: 'redeem' + item.number, type: 'button', className: 'btn btn-secondary'}, 'redeem')
            )
          )
        );
      });
      return(
        React.createElement('ul', {className: 'list-group'}, accountItems)
      );
    }
  });
  ReactDOM.render(React.createElement(RepeatModule), userAccountsList);
  setEventListeners(accounts);
}


window.onload = ()=>{
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": api + "accounts",
    "method": "GET",
    "headers": {
      "Cache-Control": "no-cache"
    }
  }

  $.ajax(settings).done(function (response) {
    //console.log(response);
    let userAccounts = response;
    renderUserAccounts(userAccounts);
  });
}
