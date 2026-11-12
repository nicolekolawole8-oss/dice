// ===== 1. GRAB ELEMENTS FROM THE PAGE (variables) =====
const header = document.getElementById("siteHeader"); // finds the header; a wrong id gives null and later lines would throw errors
const menuBtn = document.getElementById("menuBtn"); // finds the hamburger button
const navLinks = document.getElementById("navLinks"); // finds the list of nav links
const bagCount = document.getElementById("bagCount"); // finds the number inside the bag button
const toast = document.getElementById("toast"); // finds the popup message box
const heroImg = document.querySelector(".hero-img"); // finds the big hero photo for the parallax effect
let bagItems = 0; // 'let' because the value changes; stores how many items are in the bag
let toastTimer; // will store the timer that hides the toast; declared here so all functions can use it

// ===== 2. TOAST (POPUP FEEDBACK) =====
function showToast(message) { // reusable function; 'message' is the text to display
  toast.textContent = message; // puts the text in the toast; removing it shows an empty popup
  toast.classList.add("show"); // adds the CSS class that slides the toast into view
  clearTimeout(toastTimer); // cancels the old timer so fast clicks do not hide the toast early
  toastTimer = setTimeout(function () { // starts a new timer
    toast.classList.remove("show"); // slides the toast away
  }, 2500); // 2500 ms = 2.5 seconds; change it to show the toast longer or shorter
} // end showToast

// ===== 3. SCROLL EFFECTS (HEADER + HERO PARALLAX) =====
window.addEventListener("scroll", function () { // event handling: runs every time the user scrolls
  const y = window.scrollY; // how many pixels the page has been scrolled
  header.classList.toggle("scrolled", y > 40); // adds the glass header after 40px, removes it when back at the top
  if (heroImg && y < window.innerHeight) { // only move the image while the hero is on screen
    heroImg.style.transform = "translateY(" + y * 0.15 + "px)"; // moves the photo slower than the page = depth effect
  } // end if
}, { passive: true }); // 'passive' tells the browser this handler never blocks scrolling (smoother on phones)

// ===== 4. MOBILE MENU =====
menuBtn.addEventListener("click", function () { // runs when the hamburger is clicked
  const isOpen = navLinks.classList.toggle("open"); // adds the class if missing, removes it if present; returns true when added
  menuBtn.classList.toggle("open", isOpen); // animates the two lines into an X
  menuBtn.setAttribute("aria-expanded", isOpen); // tells screen readers if the menu is open
}); // end click listener
navLinks.addEventListener("click", function (event) { // listens for clicks inside the menu
  if (event.target.tagName === "A") { // only continue if a link was clicked
    navLinks.classList.remove("open"); // closes the menu after choosing a section
    menuBtn.classList.remove("open"); // resets the hamburger icon
  } // end if
}); // end listener

// ===== 5. SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(function (entries) { // watches elements and reports when they enter the screen
  entries.forEach(function (entry) { // loops through each reported element
    if (entry.isIntersecting) { // true when it is on screen
      entry.target.classList.add("visible"); // triggers the CSS fade-and-rise
      revealObserver.unobserve(entry.target); // stops watching so it animates only once
    } // end if
  }); // end forEach
}, { threshold: 0.12 }); // animate when 12% of the element is visible
document.querySelectorAll(".reveal").forEach(function (item) { // finds everything marked with .reveal
  revealObserver.observe(item); // starts watching; without this nothing would ever appear
}); // end forEach

// ===== 6. IMAGE FALLBACK (IF AN ONLINE IMAGE FAILS TO LOAD) =====
document.querySelectorAll("img").forEach(function (img) { // loops through every image on the page
  img.addEventListener("error", function () { // runs if the image cannot load (offline, blocked, wrong link)
    img.style.visibility = "hidden"; // hides the broken-image icon
    img.parentElement.style.background = "#1a1217"; // shows a dark placeholder block instead
  }); // end error listener
}); // end forEach

// ===== 7. ADD TO BAG (INTERACTIVE FEATURE) =====
document.querySelectorAll(".add-btn").forEach(function (button) { // finds every "Add to bag" button
  button.addEventListener("click", function () { // runs when that button is clicked
    bagItems = bagItems + 1; // adds one; removing this line means the bag never changes
    bagCount.textContent = bagItems; // shows the new number on the bag button
    bagCount.classList.remove("bump"); // removes the class so the animation can replay
    void bagCount.offsetWidth; // forces the browser to refresh so the animation restarts (known trick)
    bagCount.classList.add("bump"); // plays the pop animation
    button.textContent = "Added"; // changes the button text as feedback
    button.classList.add("added"); // applies the white style
    showToast(button.dataset.name + " added to your bag"); // popup using the name stored in data-name
    setTimeout(function () { // after a short delay...
      button.textContent = "Add to bag"; // ...restore the text
      button.classList.remove("added"); // ...and the style
    }, 1500); // 1.5 seconds
  }); // end click listener
}); // end forEach
document.getElementById("bagBtn").addEventListener("click", function () { // runs when the top bag button is clicked
  showToast("Your bag has " + bagItems + " item(s)"); // tells the user the current count
}); // end listener

// ===== 8. CONTACT FORM VALIDATION =====
const form = document.getElementById("contactForm"); // finds the form
const statusBox = document.getElementById("formStatus"); // finds the feedback paragraph

function setError(inputId, message) { // shows or clears the error for one field
  const input = document.getElementById(inputId); // finds the input by id
  const errorText = document.getElementById(inputId + "Error"); // finds its error element (e.g. emailError)
  errorText.textContent = message; // writes the message; empty text clears the error
  input.parentElement.classList.toggle("invalid", message !== ""); // red underline when there is a message, removed otherwise
} // end setError

function validateForm() { // checks all fields; returns true only if all are valid
  let valid = true; // assume valid until a check fails
  const name = document.getElementById("fullName").value.trim(); // .value = typed text; trim removes extra spaces
  const email = document.getElementById("email").value.trim(); // email text
  const subject = document.getElementById("subject").value.trim(); // subject text
  const message = document.getElementById("message").value.trim(); // message text
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regular expression: something@something.something with no spaces

  if (name.length < 3) { // name needs at least 3 characters
    setError("fullName", "Please enter your full name (at least 3 characters)."); // show error
    valid = false; // mark form invalid
  } else { // name is fine
    setError("fullName", ""); // clear old error
  } // end name check

  if (!emailPattern.test(email)) { // .test returns true if it matches; ! flips the result
    setError("email", "Please enter a valid email address."); // show error
    valid = false; // mark form invalid
  } else { // email is fine
    setError("email", ""); // clear old error
  } // end email check

  if (subject.length < 3) { // subject needs at least 3 characters
    setError("subject", "Please enter a subject."); // show error
    valid = false; // mark form invalid
  } else { // subject is fine
    setError("subject", ""); // clear old error
  } // end subject check

  if (message.length < 10) { // message needs at least 10 characters
    setError("message", "Your message should be at least 10 characters."); // show error
    valid = false; // mark form invalid
  } else { // message is fine
    setError("message", ""); // clear old error
  } // end message check

  return valid; // sends the result back to the code that called this function
} // end validateForm

form.addEventListener("submit", function (event) { // runs when the form is submitted
  event.preventDefault(); // stops the page reloading; deleting it refreshes the page and the feedback disappears
  statusBox.classList.remove("success"); // removes the green style from any old message
  if (validateForm()) { // if every field passed
    const formData = { // collects the values into an object
      fullName: document.getElementById("fullName").value.trim(), // name
      email: document.getElementById("email").value.trim(), // email
      subject: document.getElementById("subject").value.trim(), // subject
      message: document.getElementById("message").value.trim() // message
    }; // end object
    console.log("Verification: form validated successfully (no backend connected, nothing was sent).", formData); // required console message instead of a real submission
    statusBox.textContent = "Form validated successfully. This is a demo, so your message was not actually sent."; // honest feedback to the user
    statusBox.classList.add("success"); // shows the message in green
    showToast("Form validated"); // popup feedback
    form.reset(); // clears the fields
  } else { // at least one field failed
    statusBox.textContent = "Please fix the highlighted fields and try again."; // tells the user what to do
  } // end if
}); // end submit listener

["fullName", "email", "subject", "message"].forEach(function (id) { // loops through the four field ids
  document.getElementById(id).addEventListener("input", function () { // runs each time the user types in that field
    if (document.getElementById(id + "Error").textContent !== "") { // only re-check if an error is showing
      validateForm(); // re-validates so the error disappears once fixed
    } // end if
  }); // end input listener
}); // end forEach
