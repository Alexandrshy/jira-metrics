# Jira Control Charts

Visualization and analysis of Jira metrics using Shewhart control charts. This tool helps teams monitor development process stability through bug density and velocity analysis.

## Features

- 📊 Shewhart control charts for Jira metrics
- 📈 Analysis of bug density and team velocity
- 🎯 Customizable baseline period for control limits calculation
- 🔍 Task filtering via JQL
- 💾 Settings saved in local storage
- 📥 Export charts to PNG

## Getting Started

### Requirements

- Node.js 18+
- Jira API access

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Alexandrshy/jira-control-charts.git
cd jira-control-charts
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file in the root directory:

```bash
VITE_JIRA_HOST=https://your-instance.atlassian.net
VITE_JIRA_EMAIL=your-email@company.com
VITE_JIRA_API_TOKEN=your-api-token
```

4. Start the application:

```bash
npm run dev
```

## Usage

1. Enter a JQL query to filter tasks
2. Select baseline period for control limits calculation
3. Choose metric to analyze (bug density or velocity)
4. Analyze the control chart:
   - Red points indicate values outside control limits
   - Purple lines mark baseline period boundaries
   - Download charts for reports

## Configuration

### Environment Variables

- `VITE_JIRA_HOST`: Your Jira instance URL
- `VITE_JIRA_EMAIL`: Email for Jira access
- `VITE_JIRA_API_TOKEN`: Jira API token

## Metrics

### Bug Density
Percentage of bugs among total closed tasks per week. Helps track development quality.

### Velocity
Number of closed tasks per week. Helps track team productivity.

## Control Limits

- UCL (Upper Control Limit): Mean + 3σ
- LCL (Lower Control Limit): Mean - 3σ
- CL (Center Line): Mean value

Limits are calculated based on baseline period data.

## Support

If you encounter any issues, please create an issue on GitHub.