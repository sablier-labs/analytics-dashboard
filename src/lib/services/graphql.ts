const GRAPHQL_ENDPOINT = 'https://indexer.hyperindex.xyz/7672d32/v1/graphql';

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface UserAggregateResponse {
  User_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface TimeBasedUserResponse {
  past30Days: {
    aggregate: {
      count: number;
    };
  };
  past90Days: {
    aggregate: {
      count: number;
    };
  };
  past180Days: {
    aggregate: {
      count: number;
    };
  };
  pastYear: {
    aggregate: {
      count: number;
    };
  };
}

export interface TimeBasedUserCounts {
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
}

export interface MonthlyUserGrowth {
  month: string;
  cumulativeUsers: number;
  newUsers: number;
}

export interface MonthlyUserGrowthResponse {
  User: Array<{
    address: string;
    transactions: Array<{
      timestamp: string;
    }>;
  }>;
}

export async function fetchTotalUsers(): Promise<number> {
  const query = `
    query GetTotalUsers {
      User_aggregate(
        where: {
          transactions: {}
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<UserAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.User_aggregate.aggregate.count;
  } catch (error) {
    console.error('Error fetching total users:', error);
    throw error;
  }
}

export async function fetchTimeBasedUserCounts(): Promise<TimeBasedUserCounts> {
  // Calculate timestamps for different periods as ISO date strings
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  const oneHundredEightyDaysAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
  const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

  const query = `
    query GetTimeBasedUserCounts {
      past30Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${thirtyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      past90Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${ninetyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      past180Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${oneHundredEightyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      pastYear: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${oneYearAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TimeBasedUserResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return {
      past30Days: result.data.past30Days.aggregate.count,
      past90Days: result.data.past90Days.aggregate.count,
      past180Days: result.data.past180Days.aggregate.count,
      pastYear: result.data.pastYear.aggregate.count,
    };
  } catch (error) {
    console.error('Error fetching time-based user counts:', error);
    throw error;
  }
}

export async function fetchMonthlyUserGrowth(): Promise<MonthlyUserGrowth[]> {
  // Extended approach: get cumulative counts from Sablier's inception
  const now = new Date();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];
  
  // Start from when Sablier began
  const startDate = new Date('2023-07-01');
  const current = new Date(startDate);
  
  // Generate monthly timestamps from start date to now
  while (current <= now) {
    // Use end of month instead of beginning to capture all users in that month
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = endOfMonth.toISOString();
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    timeRanges.push({ label, timestamp });
    
    // Move to first day of next month
    current.setMonth(current.getMonth() + 1);
  }

  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: User_aggregate(
        where: {
          transactions: {
            timestamp: { _lte: "${range.timestamp}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
    `;
  });

  const query = `
    query GetCumulativeUserGrowth {
      ${queries.join('\n')}
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<any> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Process results into monthly growth data
    const monthlyData: MonthlyUserGrowth[] = [];
    
    timeRanges.forEach((range, index) => {
      const key = `month_${index}`;
      const cumulativeUsers = result.data[key].aggregate.count;
      const previousCumulative = index > 0 ? monthlyData[index - 1].cumulativeUsers : 0;
      const newUsers = cumulativeUsers - previousCumulative;
      
      
      monthlyData.push({
        month: range.label,
        cumulativeUsers,
        newUsers: Math.max(0, newUsers), // Ensure non-negative
      });
    });

    return monthlyData.filter(data => data.cumulativeUsers > 0);
  } catch (error) {
    console.error('Error fetching monthly user growth:', error);
    throw error;
  }
}