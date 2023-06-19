import {
  CardElement,
  PaymentElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";

function PaymentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const [transactions, setTransactions] = useState([]);
  
  const handleMyTransactions = async () => {
    const response = await fetch("/api/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("response", data);
    setTransactions(data);
  };

  const createSubscription = async () => {
    try {
      const paymentMethod = await stripe.createPaymentMethod({
        card: elements.getElement("card"),
        type: "card",
      });
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          paymentMethod: paymentMethod.paymentMethod.id,
        }),
      });
      if (!response.ok) return alert("Payment unsuccessful!");
      const data = await response.json();
      const confirm = await stripe.confirmCardPayment(data.clientSecret);
      if (confirm.error) return alert("Payment unsuccessful!");
      alert("Payment Successful! Subscription active.");
    } catch (err) {
      console.error(err);
      alert("Payment failed! " + err.message);
    }
  };
 
  return (
    <div style={{ width: "40%" }}>
      Name:{" "}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      Email:{" "}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <CardElement
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      <br />
      <button onClick={createSubscription}>Subscribe - 5 USD</button>
      <br />
      <button onClick={handleMyTransactions}>My Transactions</button>
      <br />
      <div>
        <h1>Transaction History</h1>
        {transactions.map((transaction) => (
          <div key={transaction.id}>
            <p>
              Date: {new Date(transaction.created * 1000).toLocaleDateString()}
            </p>
            <p>Amount: {transaction.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentForm;
