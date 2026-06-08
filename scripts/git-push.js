const { execSync } = require('child_process');

try {
  console.log("Staging files...");
  execSync('git add .', { stdio: 'inherit' });

  console.log("Committing changes...");
  execSync('git commit -m "feat: implement animated responsive navbar, realtime hero slider, asymmetric editor picks grid, head-to-head comparison matchup, specs matchup matrix comparison engine, CMS scheduling status system, and recharts analytics dashboard"', { stdio: 'inherit' });

  console.log("Pushing to remote repository...");
  execSync('git push', { stdio: 'inherit' });

  console.log("Successfully committed and pushed!");
} catch (err) {
  console.error("Git automation error:", err.message);
  process.exit(1);
}
