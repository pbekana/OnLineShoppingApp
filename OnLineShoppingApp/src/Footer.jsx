import "./index.css";
import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
export default function Footer() {
  return (
    <>
      <div className="footer-container">
        <div className="footer">
          <section>
            <h1>Contact</h1>
            <h4>Questions ? Go ahead</h4>
            <form action="#">
              <input type="text" placeholder=" name" />
              <input type="text" placeholder=" email" />
              <input type="text" placeholder=" Subject" />
              <input type="text" placeholder=" Message" />
              <button type="button">Send</button>
            </form>
          </section>
          <section>
            <nav>
              <h1>About</h1>
              <NavLink to="/AboutUs">About Us</NavLink>
              <NavLink to="/iring">We're Hiring</NavLink>
              <NavLink to="/Support">Support</NavLink>
              <NavLink to="/FindStore">Find Store</NavLink>
              <NavLink to="/Shipment">Shipment</NavLink>
              <NavLink to="/Payment">Payment</NavLink>
              <NavLink to="/GiftCard">Gift card</NavLink>
              <NavLink to="/Return">Return</NavLink>
              <NavLink to="/Help">Help</NavLink>
            </nav>
          </section>
          <section className="contact">
            <h1>The Thrift-flip Store</h1>
            <h4>Store</h4>
            <p>
              <img src="" alt="location icon" /> "Ethoipia ,Addis Ababa"
            </p>
            <p>phone number: +251 967667644</p>
            <p className="message-icon">
              <img src="data:image/png;base64,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" width="50" alt="message-icon" />
              <span className="image-span">Message</span>
            </p>
            
            <span>bekanapeter@gmail.com</span>
            <p>we accept</p>
            <p className="payment-icon">
              <span className="icon-box">
                {" "}
                <img
                  src="data:image/png;base64,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"
                  alt="G-pay icon"
                  width="50"
                  height="38"
                />{" "}
                G-pay
              </span>
            </p>
            <p className="payment-icon">
              <span className="icon-box">
                <img
                  src="data:image/png;base64,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"
                  alt="credit card icon"
                  width="50"
                />
                Credit card
              </span>
              
            </p>
          </section>
          <section className="link-media">
            <h1>Follow Us</h1>
            <NavLink to="/facebook">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt="facebook icon"
              />{" "}
              Facebook
            </NavLink>
            <NavLink to="/twitter">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                alt="twitter icon"
              />{" "}
              Twitter
            </NavLink>
            <NavLink to="/instagram">
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733558.png"
                alt="instagram icon"
              />{" "}
              Instagram
            </NavLink>
          </section>
        </div>
        <div className="card">
          <p>Powered By Peter Bekana</p>
        </div>
      </div>
    </>
  );
}
