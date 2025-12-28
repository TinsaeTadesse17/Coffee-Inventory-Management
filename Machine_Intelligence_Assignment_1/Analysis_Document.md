# Machine Intelligence Assignment 1: Agent Foundations and Analysis

**Name:** [Your Name]
**Date:** December 21, 2025

---

## Part A: Real-World Agent Analysis

### Task 1: Agent Identification and Classification

#### 1. Web Search Autocomplete (e.g., Google Search Suggestions)
*   **Agent Classification:** **Utility-Based Agent**.
    *   *Justification:* The agent doesn't just have a binary goal (found/not found) but tries to maximize a utility function based on relevance, speed, and probability of the user clicking a suggestion. It ranks suggestions based on "usefulness".
*   **PEAS Framework:**
    *   **Performance Measure:** User click-through rate (CTR), speed of suggestion display, relevance of query completion, reduction in user keystrokes.
    *   **Environment:** The web browser interface, the stream of user keystrokes, the vast database of past search queries and trends.
    *   **Actuators:** Displaying a list of text suggestions, updating the list as more characters are typed.
    *   **Sensors:** Keyboard input (keystrokes), user location (IP), search history, current time/trends.
*   **Architecture Diagram:**
    ```mermaid
    graph LR
    A[User Keystrokes] --> B(Input Processing)
    B --> C{Prediction Model}
    D[History/Trends DB] --> C
    C --> E[Ranking Engine]
    E --> F[Display Suggestions]
    ```

#### 2. Email Filtering System (e.g., Gmail Spam Filter)
*   **Agent Classification:** **Learning Agent**.
    *   *Justification:* While it acts as a reflex agent (if words="buy now" -> spam), modern filters are learning agents. They adapt their performance element based on user feedback (marking as spam/not spam) to improve classification over time.
*   **PEAS Framework:**
    *   **Performance Measure:** Accuracy (minimizing false positives and false negatives), user satisfaction, safety from malicious links.
    *   **Environment:** The email server, the user's inbox, the internet (incoming mail streams).
    *   **Actuators:** Moving emails to "Spam" folder, flagging emails as "Dangerous", deleting emails, moving to "Inbox".
    *   **Sensors:** Email content (text, images), sender address, metadata (headers), user interaction (marking as spam).
*   **Architecture Diagram:**
    ```mermaid
    graph LR
    A[Incoming Email] --> B(Feature Extractor)
    B --> C{Classifier Model}
    D[User Feedback] --> E[Learning Element]
    E --> C
    C --> F[Action: Inbox/Spam]
    ```

#### 3. Content Recommendation System (e.g., Netflix/YouTube)
*   **Agent Classification:** **Utility-Based Agent**.
    *   *Justification:* The agent aims to maximize a continuous utility metric: user engagement (watch time) and retention. It weighs different recommendations to find the one with the highest expected utility for the specific user.
*   **PEAS Framework:**
    *   **Performance Measure:** Total watch time, click-through rate, subscription renewal, session duration.
    *   **Environment:** The streaming platform application, the library of content, the user's device.
    *   **Actuators:** Populating the "Recommended for You" list, auto-playing the next video, sending notification emails.
    *   **Sensors:** User's watch history, ratings, search queries, pause/skip behavior, time of day.
*   **Architecture Diagram:**
    ```mermaid
    graph LR
    A[User Activity] --> B(Data Collection)
    B --> C{Recommendation Engine}
    D[Content Library] --> C
    C --> E[Ranked List]
    E --> F[UI Display]
    ```

### Task 2: Environment Property Analysis (Email Filtering System)

| Environment Property | Classification | Supporting Evidence |
| :--- | :--- | :--- |
| **Observability** | **Partially Observable** | The agent can see the email content and headers, but it cannot observe the sender's true intent (malicious vs. benign) or the full context of the sender's server (e.g., if it was hacked). |
| **Determinism** | **Stochastic** | The outcome of filtering is not perfectly predictable. The same email might be treated differently based on evolving global spam filters or slight variations in the model's confidence. Also, "spam" is subjective. |
| **Episode Structure** | **Episodic** | Each email classification decision is largely independent of the previous one. The agent receives an email (percept), classifies it (action), and the episode ends. (Though learning connects episodes over long term). |
| **Dynamics** | **Dynamic** | The environment changes while the agent is "thinking" (new spam techniques emerge constantly). The definition of spam evolves, and user preferences change. |
| **Action Space** | **Discrete** | The agent has a finite set of distinct actions: Label as Spam, Label as Inbox, Label as Important, Delete. |
| **Agent Population** | **Single Agent** | From the filter's perspective, it is usually operating alone to classify mail. (Could be argued as Multi-Agent if viewing Spammers as adversarial agents). |

---

## Part B: Simple Agent Implementation

### Performance Analysis

**Simulation Results (5 Runs):**
*   **Run 1:** Score: 42, Cleaned: 22
*   **Run 2:** Score: 31, Cleaned: 21
*   **Run 3:** Score: -13, Cleaned: 17
*   **Run 4:** Score: 64, Cleaned: 24
*   **Run 5:** Score: 130, Cleaned: 30

**Average Metrics:**
*   **Average Performance Score:** 50.8
*   **Average Cells Cleaned:** 22.8

**Analysis of Limitations:**
The simple reflex agent suffers from a lack of memory and state.
1.  **Inefficient Exploration:** When there are no adjacent dirty cells, the agent moves randomly. This often leads to "pacing" back and forth between clean cells or revisiting areas it has already cleaned, wasting time steps and reducing the score.
2.  **Getting Stuck:** In complex obstacle configurations (like a U-shape), the random movement might fail to guide the agent out efficiently.
3.  **Local Optima:** The agent only looks at immediate neighbors. It cannot "see" a dirty cell two steps away, so it might walk away from a cluster of dirt just because the immediate path is clean.

**Suggested Improvement:**
**Add State/Memory:** The agent should maintain a map of "visited" cells.
*   **Improvement:** Implement a "Model-Based Reflex Agent".
*   **Mechanism:** Store coordinates of visited cells. When no adjacent dirty cells are found, prioritize moving to an *unvisited* adjacent cell over a visited one. This would drive the agent to explore the unknown parts of the grid systematically rather than wandering randomly.

---

## Part C: Conceptual Reflection

**Intelligent Agents vs. Traditional Software**

The distinction between an intelligent agent and traditional software lies primarily in **autonomy**, **adaptability**, and the **perception-action cycle**.

**1. Autonomy and Agency**
Traditional software, like a calculator or a standard word processor, is passive. It waits for explicit user input to perform a specific function. It does not "act" on its own volition. In contrast, the **Grid Cleaning Agent** implemented in Part B demonstrates autonomy. Once the simulation starts, it operates independently for 200 steps. It makes its own decisions (Clean vs. Move) based on its rules without human intervention. It has "agency"—the capacity to act in an environment.

**2. Goal-Directed Behavior**
Traditional software is often function-based (Input -> Output). Intelligent agents are goal-directed. The **Web Search Agent** analyzed in Part A doesn't just match strings; it strives to maximize the "utility" of the result for the user. It actively seeks the best outcome. Our cleaning agent has an implicit goal (maximize score/clean dirt) and its actions are selected to further that goal, even if the path isn't pre-programmed explicitly for every grid configuration.

**3. Interaction with Dynamic Environments**
Traditional software often assumes a static or controlled environment (e.g., a file system). Intelligent agents, like the **Email Filter**, operate in dynamic, stochastic environments. The spam filter must cope with an adversary (spammers) who constantly change their tactics. The agent must perceive these changes (via sensors) and adapt its actions (via actuators) in real-time. The PEAS framework analysis highlights how agents are defined by this coupling with their environment, whereas traditional software is defined by its internal algorithms.

In summary, while traditional software is a tool used *by* a human, an intelligent agent is a system that acts *for* a human (or itself) to achieve goals in a complex environment.
