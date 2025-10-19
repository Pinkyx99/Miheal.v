
import React from 'react';

interface RouletteInfoPageProps {
    onNavigate: (view: 'roulette') => void;
}

const RouletteInfoPage: React.FC<RouletteInfoPageProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-text-muted animate-fade-in">
            <button onClick={() => onNavigate('roulette')} className="mb-8 flex items-center space-x-2 text-sm font-semibold text-accent-green hover:underline">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>Back to Roulette</span>
            </button>
            <article className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-heading-bright prose-strong:text-white/90 prose-a:text-accent-green hover:prose-a:underline">
                <h1>Spin into Gamboom Roulette</h1>
                <p>Welcome to Gamboom Roulette, where every spin of the wheel could lead to thrilling wins. Whether you're a seasoned player or just starting, this unique take on the traditional format offers an exciting experience with multiple betting options, cryptocurrency support, and the possibility of hitting massive jackpots.</p>

                <h2>What is Gamboom Roulette?</h2>
                <img src="https://i.imgur.com/GDFi8dG.png" alt="Gamboom Roulette table with bets" />
                <p>Gamboom Roulette is an exciting take on the classic casino game that combines the timeless appeal of roulette with the convenience of online play. In roulette, players place bets on where a small ball will land on a spinning wheel, which is divided into numbered pockets. You can wager on a single number, groups of numbers, the colour (red or black), or whether the number will be odd or even.</p>
                <p>What sets Gamboom Roulette apart is its unique blend of traditional gameplay and modern features, including cryptocurrency support, a variety of betting options, and the potential for big payouts. With simple rules and fast-paced rounds, it's no wonder that roulette continues to be a favourite among casino fans worldwide. Whether you're new to the game or a seasoned pro, Gamboom Roulette offers a thrilling experience every time you play.</p>

                <h2>Gamboom Roulette: Progressive Jackpots</h2>
                <img src="https://i.imgur.com/vHq4gXF.png" alt="Progressive Jackpot display in Gamboom" />
                <p>With Gamboom Roulette, the excitement doesn't stop at the table. With each spin, you get a chance to win not just your regular payouts, but also a share of the progressive jackpot. Every bet you place contributes to this jackpot pool, which continues to grow until it's triggered, offering the potential for life-changing rewards.</p>
                <h3>How the Jackpot is Paid Out:</h3>
                <p>When the Roulette Jackpot is won, the payout distribution is based on the individual performance of each player in that round. Here’s how the payout works:</p>
                <ul>
                    <li><strong>Contribution Phase:</strong> Every time you place a bet during a jackpot-eligible round, a portion of your bet goes into the growing jackpot pool. This pool accumulates with each round, creating a progressive jackpot that can reach impressive amounts.</li>
                    <li><strong>Winning the Jackpot:</strong> Once the jackpot is triggered, it's distributed among the winners based on their individual profit for that round. This ensures that players who perform well have a better chance of receiving a larger share of the jackpot.</li>
                    <li><strong>Payout Formula:</strong> The payout for each player is calculated using the following formula: Payout = (Player's Profit / Total Profit) x Jackpot Amount. This approach ensures that your payout is proportionate to the profit you earned during the round, making the jackpot distribution fair and rewarding.</li>
                </ul>

                <h2>The Fascinating History of Roulette</h2>
                <p>Roulette has a captivating history that spans several centuries. Here's a brief timeline of how this iconic game evolved:</p>
                <ul>
                    <li><strong>17th Century:</strong> The roots of roulette can be traced back to France in the 1600s. The famous mathematician and physicist Blaise Pascal is often credited with creating an early form of the game during his experiments with perpetual motion machines.</li>
                    <li><strong>Late 18th Century (1790s):</strong> The modern version of roulette as we know it began to take shape in France. The design of the wheel was paired with a variety of betting options, making it an instant hit in French casinos. This is when the game began to grow in popularity across Europe.</li>
                    <li><strong>19th Century:</strong> Roulette spread throughout Europe, becoming a staple in the casinos of France, Germany, and Monte Carlo. During this time, the single-zero roulette wheel became synonymous with European Roulette. The game also crossed the Atlantic to the United States, where a new variant, American Roulette, was introduced. The key difference was the addition of a double zero on the wheel, increasing the house edge.</li>
                    <li><strong>20th Century:</strong> Roulette becomes one of the most popular games worldwide. European Roulette, with its single zero, became a preferred choice in most casinos, while American Roulette remained a standard in the U.S.</li>
                    <li><strong>21st Century:</strong> Today, roulette has transitioned to online platforms, where you can enjoy both live dealer and digital versions of the game. Variants such as Lightning Roulette and Quantum Roulette have also introduced exciting new features, including multipliers and unique betting options, enhancing the classic game.</li>
                </ul>

                <h2>The Basics of Gamboom Roulette</h2>
                <p>At Gamboom Roulette, we stick closely to the classic rules, while offering a unique twist on the traditional format. Instead of a spinning wheel, the game features a line of red and black numbers arranged in a carousel. You select your numbers from this lineup, adding a modern touch to the classic experience.</p>
                <p>Our provably fair system ensures that every outcome is completely random and fair. This transparent technology allows you to verify the fairness of each result, ensuring a trustworthy gaming environment for all.</p>
                
                <h2>How to Play Gamboom Roulette</h2>
                 <ul>
                    <li><strong>Place Your Bets:</strong> Begin by choosing your bet type and amount. Gamboom Roulette offers a variety of betting options, including inside bets (such as straight, split, street, and corner bets) and outside bets (such as red/black, odd/even, high/low). You can bet on single numbers, groups of numbers, colours, or categories like odd or even.</li>
                    <li><strong>Spin the Carousel:</strong> Once your bets are placed, the carousel of numbers begins. The system will randomly select a number, determining the outcome.</li>
                    <li><strong>Outcome:</strong> If the randomly selected number matches your chosen bet, you win! Your payout will depend on the type of bet placed. Inside bets offer higher payouts with greater risk, while outside bets provide better odds but lower returns.</li>
                </ul>
                <p>For more detailed strategies to improve your game, check out our blog on the 10 Best Betting Strategies to Try in Gamboom Roulette Games.</p>

                <h2>Game Features and Betting Options</h2>
                <img src="https://i.imgur.com/39a6JtP.png" alt="Roulette game features" />
                <p>Discover a unique twist on the classic roulette experience with Gamboom Roulette, featuring exciting elements that elevate your gameplay:</p>
                 <ul>
                    <li><strong>User-Friendly Interface:</strong> The game's clean and intuitive layout makes it easy to select your numbers from the carousel and place bets quickly.</li>
                    <li><strong>Instant Results:</strong> With each spin of the number carousel, you'll get immediate outcomes, keeping the thrill alive from round to round.</li>
                    <li><strong>Variety of Betting Options:</strong> Choose from a wide range of bets to suit your strategy and playing style. Find out more about the best roulette bets.</li>
                    <li><strong>Progressive Jackpot Feature:</strong> Every spin contributes to a growing progressive jackpot, giving you the chance to win big. Keep an eye on the jackpot as it builds—one spin could change everything.</li>
                    <li><strong>Real-Time Statistics:</strong> Stay informed with real-time stats that help you make smarter betting decisions while maximising your strategy.</li>
                    <li><strong>Bitcoin Functionality:</strong> Gamboom Roulette supports Bitcoin transactions, allowing you to enjoy fast, secure, and anonymous gameplay. Learn more about why you should use Bitcoin to bet online.</li>
                    <li><strong>Provably Fair Gaming:</strong> Our provably fair system ensures that every outcome is random and transparent, giving you confidence in each spin's fairness.</li>
                </ul>

            </article>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
              .prose-invert {
                  --tw-prose-body: #9CA3AF;
                  --tw-prose-headings: #FFFFFF;
                  --tw-prose-lead: #9CA3AF;
                  --tw-prose-links: #00C17B;
                  --tw-prose-bold: #FFFFFF;
                  --tw-prose-counters: #9CA3AF;
                  --tw-prose-bullets: #9CA3AF;
                  --tw-prose-hr: rgba(255,255,255,0.1);
                  --tw-prose-quotes: #FFFFFF;
                  --tw-prose-quote-borders: #00C17B;
                  --tw-prose-captions: #9CA3AF;
                  --tw-prose-code: #FFFFFF;
                  --tw-prose-pre-code: #9CA3AF;
                  --tw-prose-pre-bg: #0D1316;
                  --tw-prose-th-borders: rgba(255,255,255,0.1);
                  --tw-prose-td-borders: rgba(255,255,255,0.05);
              }
              .prose img {
                  border-radius: 0.75rem;
                  border: 1px solid rgba(255,255,255,0.1);
                  margin-top: 1em;
                  margin-bottom: 1em;
              }
            `}</style>
        </div>
    );
};

export default RouletteInfoPage;