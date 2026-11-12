/* =====================================================================
   DICE – MAIN JAVASCRIPT FILE (js/script.js)
   This EXTERNAL JavaScript file is linked at the bottom of index.html.
   Every line is commented: what it does + what happens if you delete/change it.
   ===================================================================== */

// Removes the "no-js" class from <html>. CSS uses .no-js as a fallback to show content if JS fails.
// Delete this line and the reveal animations never hide content first (the page still works, just without the reveal effect).
document.documentElement.classList.remove("no-js");

/* ---------------------------------------------------------------------
   1. VARIABLES: grab the HTML elements we need, once, at the top
   document.querySelector() finds the FIRST element matching a CSS selector.
   document.getElementById() finds the element with that id.
   If an id is misspelled here, the variable becomes null and that feature stops working.
   --------------------------------------------------------------------- */
const header = document.getElementById("header");                 // The top header bar (gets the .scrolled class).
const menuToggle = document.getElementById("menuToggle");         // The hamburger button.
const navLinks = document.getElementById("navLinks");             // The <ul> of nav links (opened on mobile).
const allNavLinks = document.querySelectorAll(".nav__link");      // querySelectorAll returns a LIST of all nav links.
const sections = document.querySelectorAll("main section[id]");   // Every <section> inside <main> that has an id (used for active-link highlighting).
const scrollProgress = document.getElementById("scrollProgress"); // The thin progress bar at the top.
const backToTop = document.getElementById("backToTop");           // The "↑" button.
const cursorGlow = document.getElementById("cursorGlow");         // The pink glow that follows the mouse.
const bagCount = document.getElementById("bagCount");             // The number bubble on the bag icon.
const bagBtn = document.getElementById("bagBtn");                 // The bag button itself.
const toastContainer = document.getElementById("toastContainer"); // Where pop-up notifications are inserted.
const filterButtons = document.querySelectorAll(".filter-btn");   // All product filter buttons.
const productCards = document.querySelectorAll(".product-card");  // All product cards.
const addButtons = document.querySelectorAll(".add-btn");         // All "Add to bag" buttons.

let bagItems = 0;                                                 // "let" = a variable that CAN change. Counts items in the bag. Using "const" here would cause an error when we add 1.

/* ---------------------------------------------------------------------
   2. TOAST NOTIFICATIONS: reusable FUNCTION for user feedback
   A function is a reusable block of code. We "call" it with showToast("text").
   --------------------------------------------------------------------- */
function showToast(message) {                                     // Declares a function with one parameter: the message to display.
  const toast = document.createElement("div");                    // Creates a brand-new <div> in memory (not on the page yet).
  toast.className = "toast";                                      // Gives it the .toast class so the CSS styles it.
  toast.textContent = message;                                    // Puts the text inside. textContent is safe (it doesn't run HTML).
  toastContainer.appendChild(toast);                              // Adds the toast to the page. Without this line nothing appears.

  setTimeout(function () {                                        // setTimeout runs code later. After 2.8 seconds...
    toast.classList.add("out");                                   // ...add .out to play the fade-out animation.
    setTimeout(function () {                                      // Then, after the 0.4s animation...
      toast.remove();                                             // ...delete the element so toasts don't pile up in the HTML.
    }, 400);                                                      // 400 milliseconds = 0.4 seconds (matches the CSS animation).
  }, 2800);                                                       // 2800 ms = how long the toast stays visible. Increase to show it longer.
}

/* ---------------------------------------------------------------------
   3. MOBILE MENU TOGGLE (event handling)
   --------------------------------------------------------------------- */
function toggleMenu() {                                           // Function that opens/closes the mobile menu.
  const isOpen = navLinks.classList.toggle("open");               // toggle() adds .open if missing, removes it if present, and returns true/false.
  menuToggle.classList.toggle("open", isOpen);                    // Animates the hamburger into an "X" when open (the 2nd argument forces the same state).
  menuToggle.setAttribute("aria-expanded", isOpen);               // Tells screen readers whether the menu is open (accessibility).
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu"); // Ternary operator: condition ? valueIfTrue : valueIfFalse.
}

menuToggle.addEventListener("click", toggleMenu);                 // EVENT LISTENER: run toggleMenu every time the hamburger is clicked. Delete it and the mobile menu never opens.

allNavLinks.forEach(function (link) {                             // forEach loops over every nav link...
  link.addEventListener("click", function () {                    // ...and listens for clicks on each one.
    if (navLinks.classList.contains("open")) {                    // If the mobile menu is currently open...
      toggleMenu();                                               // ...close it after choosing a section (otherwise it would cover the page).
    }
  });
});

document.addEventListener("keydown", function (event) {           // Listens for any keyboard key on the whole page.
  if (event.key === "Escape" && navLinks.classList.contains("open")) { // If the key is Escape AND the menu is open...
    toggleMenu();                                                 // ...close the menu (expected accessibility behaviour).
  }
});

/* ---------------------------------------------------------------------
   4. SCROLL EFFECTS: header style, progress bar, back-to-top, active link
   --------------------------------------------------------------------- */
function handleScroll() {                                         // Runs every time the user scrolls.
  const scrollY = window.scrollY;                                 // How many pixels the page has been scrolled from the top.
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable distance.
  const progress = pageHeight > 0 ? (scrollY / pageHeight) * 100 : 0; // Converts the position into a percentage (0–100). The check avoids dividing by zero.

  scrollProgress.style.width = progress + "%";                    // Sets the progress bar width. Delete it and the bar never grows.
  header.classList.toggle("scrolled", scrollY > 20);              // Adds the frosted background once you scroll past 20px.
  backToTop.classList.toggle("show", scrollY > 600);              // Shows the back-to-top button after 600px.

  let currentId = "home";                                         // Default active section.
  sections.forEach(function (section) {                           // Checks every section...
    const top = section.offsetTop - 140;                          // ...where it starts (minus an offset for the header).
    if (scrollY >= top) {                                         // If we've scrolled past its start...
      currentId = section.getAttribute("id");                     // ...it becomes the current section (the last one passed wins).
    }
  });

  allNavLinks.forEach(function (link) {                           // Updates every nav link...
    const isActive = link.getAttribute("href") === "#" + currentId; // ...true if its href matches the current section.
    link.classList.toggle("active", isActive);                    // Highlights only the matching link.
  });
}

window.addEventListener("scroll", handleScroll, { passive: true }); // Calls handleScroll on scroll. "passive" tells the browser we won't block scrolling = smoother.
handleScroll();                                                   // Runs once on load so everything is correct if the page opens mid-scroll.

backToTop.addEventListener("click", function () {                 // When the ↑ button is clicked...
  window.scrollTo({ top: 0, behavior: "smooth" });                // ...smoothly scroll back to the very top.
});

/* ---------------------------------------------------------------------
   5. SCROLL REVEAL WITH STAGGER (IntersectionObserver)
   IntersectionObserver tells us when an element enters the screen,
   which is far more efficient than checking positions on every scroll.
   --------------------------------------------------------------------- */
const revealElements = document.querySelectorAll(".reveal");      // Every element that should animate in.

revealElements.forEach(function (el) {                            // For each one...
  const siblings = Array.from(el.parentElement.children).filter(function (child) { // ...find its brothers/sisters that also reveal...
    return child.classList.contains("reveal");                    // (keep only elements with .reveal).
  });
  const index = siblings.indexOf(el);                             // Its position among them (0, 1, 2...).
  el.style.setProperty("--delay", index * 0.1 + "s");             // STAGGER: each sibling waits 0.1s longer. Set 0 to make them all appear together.
});

const revealObserver = new IntersectionObserver(function (entries, observer) { // Creates the observer with a callback function.
  entries.forEach(function (entry) {                              // entries = elements whose visibility changed.
    if (entry.isIntersecting) {                                   // If the element is now on screen...
      entry.target.classList.add("visible");                      // ...add .visible → CSS fades and slides it in.
      observer.unobserve(entry.target);                           // Stop watching it so it only animates once.
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });         // threshold 0.12 = trigger when 12% is visible; rootMargin triggers slightly before the bottom edge.

revealElements.forEach(function (el) {                            // Tell the observer to watch...
  revealObserver.observe(el);                                     // ...every reveal element. Delete this and nothing ever appears!
});

/* ---------------------------------------------------------------------
   6. ANIMATED NUMBER COUNTERS (hero stats)
   --------------------------------------------------------------------- */
function animateCounter(el) {                                     // Counts a number up from 0 to its data-target.
  const target = Number(el.dataset.target);                       // Reads data-target="50" from HTML and converts the text to a number.
  const duration = 1800;                                          // Animation length in milliseconds.
  const startTime = performance.now();                            // Precise timestamp of when we started.

  function update(now) {                                          // Inner function that runs every animation frame (~60 times a second).
    const elapsed = Math.min((now - startTime) / duration, 1);    // Progress from 0 to 1 (Math.min stops it going past 1).
    const eased = 1 - Math.pow(1 - elapsed, 3);                   // "Ease-out" maths: fast start, slow finish (feels natural).
    el.textContent = Math.floor(eased * target);                  // Shows the current whole number.
    if (elapsed < 1) {                                            // If not finished...
      requestAnimationFrame(update);                              // ...schedule the next frame.
    }
  }
  requestAnimationFrame(update);                                  // Starts the loop.
}

const counterObserver = new IntersectionObserver(function (entries, observer) { // Starts counters only when they're visible.
  entries.forEach(function (entry) {                              // For each counter...
    if (entry.isIntersecting) {                                   // ...that is now on screen...
      animateCounter(entry.target);                               // ...run the count-up...
      observer.unobserve(entry.target);                           // ...only once.
    }
  });
}, { threshold: 0.6 });                                           // 60% of the number must be visible.

document.querySelectorAll(".counter").forEach(function (el) {     // Find every counter...
  counterObserver.observe(el);                                    // ...and watch it.
});

/* ---------------------------------------------------------------------
   7. AMBIENT CURSOR GLOW + PRODUCT CARD SPOTLIGHT (mouse events)
   --------------------------------------------------------------------- */
window.addEventListener("mousemove", function (event) {           // Fires whenever the mouse moves.
  cursorGlow.style.opacity = "1";                                 // Make the glow visible.
  cursorGlow.style.transform =                                    // Move the glow to the mouse position...
    "translate(" + (event.clientX - 250) + "px, " + (event.clientY - 250) + "px)"; // ...minus half its size (250) so it's centred.
});

document.addEventListener("mouseleave", function () {             // When the mouse leaves the window...
  cursorGlow.style.opacity = "0";                                 // ...hide the glow.
});

productCards.forEach(function (card) {                            // For each product card...
  card.addEventListener("mousemove", function (event) {           // ...track the mouse inside it.
    const rect = card.getBoundingClientRect();                    // The card's position and size on screen.
    card.style.setProperty("--mx", event.clientX - rect.left + "px"); // Mouse X inside the card → CSS variable used by the spotlight gradient.
    card.style.setProperty("--my", event.clientY - rect.top + "px");  // Mouse Y inside the card.
  });
});

/* ---------------------------------------------------------------------
   8. MAGNETIC BUTTONS (microinteraction)
   Buttons with the .magnetic class gently follow the cursor.
   --------------------------------------------------------------------- */
document.querySelectorAll(".magnetic").forEach(function (btn) {   // Every magnetic button...
  btn.addEventListener("mousemove", function (event) {            // ...while the mouse moves over it:
    const rect = btn.getBoundingClientRect();                     // Button position/size.
    const x = event.clientX - rect.left - rect.width / 2;         // Distance from the button centre (horizontal).
    const y = event.clientY - rect.top - rect.height / 2;         // Distance from the centre (vertical).
    btn.style.transform = "translate(" + x * 0.2 + "px, " + y * 0.3 + "px)"; // Moves 20–30% of that distance. Bigger numbers = stronger pull.
  });
  btn.addEventListener("mouseleave", function () {                // When the mouse leaves...
    btn.style.transform = "";                                     // ...reset, and the CSS transition springs it back.
  });
});

/* ---------------------------------------------------------------------
   9. PRODUCT FILTER (interactive feature)
   --------------------------------------------------------------------- */
function filterProducts(category) {                               // Shows only products in the chosen category.
  productCards.forEach(function (card) {                          // Look at every product card...
    const matches = category === "all" || card.dataset.category === category; // ...true if "all" is chosen OR its data-category matches.
    card.classList.toggle("hide", !matches);                      // Hide cards that don't match (! means "not").
    if (matches) {                                                // For visible cards...
      card.classList.remove("visible");                           // ...reset the reveal state...
      void card.offsetWidth;                                      // ...force the browser to re-calculate layout (restarts the transition)...
      card.classList.add("visible");                              // ...and fade them back in for a smooth effect.
    }
  });
}

filterButtons.forEach(function (button) {                         // For each filter button...
  button.addEventListener("click", function () {                  // ...when it's clicked:
    filterButtons.forEach(function (b) {                          // Remove the highlight...
      b.classList.remove("active");                               // ...from all buttons.
    });
    button.classList.add("active");                               // Highlight the clicked button.
    filterProducts(button.dataset.filter);                        // Run the filter using its data-filter value.
  });
});

/* ---------------------------------------------------------------------
   10. ADD TO BAG (interactive feature with feedback)
   This is a demo: nothing is actually purchased.
   --------------------------------------------------------------------- */
addButtons.forEach(function (button) {                            // For every "Add to bag" button...
  button.addEventListener("click", function () {                  // ...on click:
    bagItems = bagItems + 1;                                      // Increase the counter variable by 1.
    bagCount.textContent = bagItems;                              // Show the new number on the bag icon.

    bagBtn.classList.remove("bump");                              // Remove the bounce class (in case it's still there)...
    void bagBtn.offsetWidth;                                      // ...force a reflow so the animation can restart...
    bagBtn.classList.add("bump");                                 // ...and add it again to play the bounce.

    const originalText = button.textContent;                      // Remember the button text ("Add to bag").
    button.textContent = "✓ Added";                               // Instant visual feedback on the button.
    button.classList.add("added");                                // White "added" style.
    button.disabled = true;                                       // Prevent accidental double clicks.

    setTimeout(function () {                                      // After 1.4 seconds...
      button.textContent = originalText;                          // ...restore the original text...
      button.classList.remove("added");                           // ...and style...
      button.disabled = false;                                    // ...and re-enable it.
    }, 1400);                                                     // Delay in ms.

    showToast("🛍️ " + button.dataset.name + " added to your bag"); // Pop-up message using the product's data-name.
  });
});

bagBtn.addEventListener("click", function () {                    // Clicking the bag icon...
  const word = bagItems === 1 ? "item" : "items";                 // ...chooses singular or plural...
  showToast("Your bag has " + bagItems + " " + word ); // ...and shows a summary toast.
});

/* ---------------------------------------------------------------------
   11. FORM VALIDATION HELPERS (reusable functions)
   --------------------------------------------------------------------- */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;             // REGULAR EXPRESSION: text@text.xx (no spaces). Loosen it and invalid emails slip through.

function setError(input, message) {                               // Marks a field as invalid and shows a message.
  const group = input.closest(".form-group");                     // closest() climbs up to the parent .form-group.
  group.classList.add("error");                                   // Red styling from CSS.
  group.classList.remove("success");                              // Remove green styling if present.
  group.querySelector(".error-msg").textContent = message;        // Write the error message under the field.
  input.setAttribute("aria-invalid", "true");                     // Tells assistive technology the field is invalid.
}

function setSuccess(input) {                                      // Marks a field as valid.
  const group = input.closest(".form-group");                     // Find its .form-group.
  group.classList.remove("error");                                // Remove red styling.
  group.classList.add("success");                                 // Add green styling.
  group.querySelector(".error-msg").textContent = "";             // Clear any old error message.
  input.removeAttribute("aria-invalid");                          // Field is no longer invalid.
}

function validateField(input) {                                   // Checks ONE field and returns true (valid) or false (invalid).
  const value = input.value.trim();                               // trim() removes spaces at the start/end, so "   " counts as empty.

  if (input.id === "fullName") {                                  // --- Full name rules ---
    if (value === "") {                                           // Empty?
      setError(input, "Please enter your full name.");            // Show message.
      return false;                                               // Stop: invalid.
    }
    if (value.length < 3 || !value.includes(" ")) {               // Too short or only one word?
      setError(input, "Please enter your first and last name.");  // Ask for a full name.
      return false;                                               // Invalid.
    }
  }

  if (input.id === "email") {                                     // --- Email rules ---
    if (value === "") {                                           // Empty?
      setError(input, "Please enter your email address.");        // Message.
      return false;                                               // Invalid.
    }
    if (!emailPattern.test(value)) {                              // test() checks the text against the pattern.
      setError(input, "Please enter a valid email, e.g. name@example.com."); // Helpful example.
      return false;                                               // Invalid.
    }
  }

  if (input.id === "subject") {                                   // --- Subject rules ---
    if (value.length < 3) {                                       // Fewer than 3 characters (includes empty)?
      setError(input, "Subject must be at least 3 characters.");  // Message.
      return false;                                               // Invalid.
    }
  }

  if (input.id === "message") {                                   // --- Message rules ---
    if (value.length < 10) {                                      // Fewer than 10 characters?
      setError(input, "Message must be at least 10 characters."); // Message.
      return false;                                               // Invalid.
    }
  }

  setSuccess(input);                                              // If no rule failed, the field is valid.
  return true;                                                    // Report success.
}

/* ---------------------------------------------------------------------
   12. CONTACT FORM: live validation + submit handling
   IMPORTANT: no backend is connected, so NOTHING is sent.
   Valid data is only logged to the browser console for verification.
   --------------------------------------------------------------------- */
const contactForm = document.getElementById("contactForm");       // The <form> element.
const formFeedback = document.getElementById("formFeedback");     // The feedback message box.
const messageInput = document.getElementById("message");          // The message textarea.
const charCount = document.getElementById("charCount");           // The "0 / 500" counter.
const submitBtn = document.getElementById("submitBtn");           // The submit button.
const formFields = contactForm.querySelectorAll("input, textarea"); // All 4 fields inside the form.

formFields.forEach(function (field) {                             // For each field...
  field.addEventListener("blur", function () {                    // "blur" = the user leaves the field (clicks/tabs away)...
    if (field.value.trim() !== "") {                              // ...if they typed something...
      validateField(field);                                       // ...check it immediately (live feedback).
    }
  });
  field.addEventListener("input", function () {                   // "input" = every keystroke...
    if (field.closest(".form-group").classList.contains("error")) { // ...if the field is currently showing an error...
      validateField(field);                                       // ...re-check so the error disappears as soon as it's fixed.
    }
  });
});

messageInput.addEventListener("input", function () {              // On every keystroke in the message box...
  const length = messageInput.value.length;                       // ...count the characters...
  charCount.textContent = length + " / 500";                      // ...update the counter text...
  charCount.classList.toggle("warn", length > 450);               // ...and turn it pink when close to the limit.
});

contactForm.addEventListener("submit", function (event) {         // When the form is submitted (button click or Enter key)...
  event.preventDefault();                                         // ...STOP the browser's default action (reloading the page). Delete this and the page refreshes, losing all input!

  let isFormValid = true;                                         // Assume valid until a field fails.
  let firstInvalid = null;                                        // Remembers the first wrong field so we can focus it.

  formFields.forEach(function (field) {                           // Validate every field...
    const ok = validateField(field);                              // ...true or false.
    if (!ok) {                                                    // If this one failed...
      isFormValid = false;                                        // ...the whole form is invalid...
      if (!firstInvalid) {                                        // ...and if it's the first failure...
        firstInvalid = field;                                     // ...remember it.
      }
    }
  });

  formFeedback.className = "form-feedback";                       // Reset the feedback box classes.
  void formFeedback.offsetWidth;                                  // Force reflow so the fade animation replays.

  if (!isFormValid) {                                             // ---- INVALID ----
    formFeedback.textContent = "Please fix the highlighted fields and try again."; // Explain what's wrong.
    formFeedback.classList.add("show", "fail");                   // Red feedback box.
    firstInvalid.focus();                                         // Move the cursor to the first problem (great for usability).
    return;                                                       // Stop here; don't continue to the success code.
  }

  // ---- VALID ----
  const formData = {                                              // An OBJECT that groups the form values with names (keys).
    fullName: document.getElementById("fullName").value.trim(),   // Name.
    email: document.getElementById("email").value.trim(),         // Email.
    subject: document.getElementById("subject").value.trim(),     // Subject.
    message: messageInput.value.trim(),                           // Message.
    validatedAt: new Date().toLocaleString()                      // Current date and time as readable text.
  };

  console.log("%c✅ Dice contact form: validation passed", "color:#ff2d87;font-weight:bold;font-size:14px"); // Styled verification message in the browser console (%c applies the CSS).
  console.table(formData);                                        // Prints the data as a neat table in the console so you can verify it.
  console.log("ℹ️ No backend is connected, so this message was NOT sent anywhere."); // Honest note: this is a demo only.

  formFeedback.textContent = "✓ Form validated successfully.."; // Clear, honest user feedback.
  formFeedback.classList.add("show", "success");                  // Green feedback box.
  showToast("✓ Validation passed. Check the console");            // Small pop-up confirmation.

  submitBtn.textContent = "✓ Validated";                          // Temporary button feedback.
  setTimeout(function () {                                        // After 2.5 seconds...
    submitBtn.textContent = "Submit message";                     // ...restore the label.
  }, 2500);                                                       // Delay.

  contactForm.reset();                                            // Clears all the fields.
  charCount.textContent = "0 / 500";                              // Resets the character counter.
  formFields.forEach(function (field) {                           // Removes the green "success" styling...
    field.closest(".form-group").classList.remove("success");     // ...from every field so the form looks fresh.
  });
});

/* ---------------------------------------------------------------------
   13. NEWSLETTER FORM VALIDATION (demo, nothing is sent)
   --------------------------------------------------------------------- */
const newsletterForm = document.getElementById("newsletterForm"); // The newsletter <form>.
const newsletterEmail = document.getElementById("newsletterEmail"); // Its email input.

newsletterForm.addEventListener("submit", function (event) {      // On submit...
  event.preventDefault();                                         // ...stop the page reloading.
  const value = newsletterEmail.value.trim();                     // Read the typed email.

  newsletterForm.classList.remove("invalid");                     // Reset the error state...
  void newsletterForm.offsetWidth;                                // ...and force a reflow so the shake can replay.

  if (!emailPattern.test(value)) {                                // If the email is invalid (reuses the same regex as the contact form)...
    newsletterForm.classList.add("invalid");                      // ...shake the form...
    showToast("⚠️ Please enter a valid email address");           // ...and explain why.
    newsletterEmail.focus();                                      // Put the cursor back in the field.
    return;                                                       // Stop.
  }

  console.log("✅ Newsletter email validated:", value); // Console verification, no real subscription.
  showToast("🎉 Email validated."); // Honest feedback.
  newsletterForm.reset();                                         // Clear the field.
});

/* ---------------------------------------------------------------------
   14. FOOTER YEAR (small dynamic detail)
   --------------------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear(); // Inserts the current year (e.g. 2026) so the copyright never goes out of date.
