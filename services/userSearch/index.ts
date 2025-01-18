import getDynamoDBClient from "@/libs/aws/index";
import { createId } from "@paralleldrive/cuid2";
import moment from "moment";

const dynamoDB = getDynamoDBClient();
const TABLE_NAME = "UserSearches";

export class UserSearchService {
  async create(args: {
    data: Omit<UserSearch, "id" | "createdAt">;
  }): Promise<UserSearch> {
    const id = createId();
    const createdAt = new Date().toISOString();
    const newItem = { ...args.data, id, createdAt };

    const params = {
      TableName: TABLE_NAME,
      Item: newItem,
    };

    await dynamoDB.put(params).promise();
    return newItem;
  }

  // Get popular searches within a time range
  async getPopularSearches(args: {
    startDate: string;
    endDate: string;
    limit?: number;
  }): Promise<{ searchQuery: string; count: number }[]> {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: "createdAt BETWEEN :gte AND :lte",
      ExpressionAttributeValues: {
        ":gte": args.startDate,
        ":lte": args.endDate,
      },
      ProjectionExpression: "searchQuery", // Only fetch the query field since that's all we need
    };

    const data = await dynamoDB.scan(params).promise();
    const items = data.Items as UserSearch[];

    // Aggregate searches and count occurrences
    const searchCounts = items.reduce((acc, item) => {
      const normalizedQuery = item.searchQuery.trim().toLowerCase(); // Normalize queries to count similar searches
      acc[normalizedQuery] = (acc[normalizedQuery] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Only return queries that appear more than once
    return Object.entries(searchCounts)
      .filter(([_, count]) => count > 5) // Only include searches done over 5 times
      .map(([searchQuery, count]) => ({ searchQuery, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, args.limit || 10);
  }

  // Get recent searches
  async getRecentSearches(args: {
    userId: string;
    limit?: number;
  }): Promise<UserSearch[]> {
    const maxDate = moment.utc().toISOString();
    const minDate = moment.utc().subtract(7, "days").toISOString();

    const expressionAttributeValues: any = {
      ":userId": args.userId,
      ":gte": minDate,
      ":lte": maxDate,
    };

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression:
        "userId = :userId AND createdAt BETWEEN :gte AND :lte",
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false,
      Limit: args.limit || 10,
    };

    const data = await dynamoDB.query(params).promise();
    const items = data.Items as UserSearch[];

    // Filter duplicates
    const uniqueItems = items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.searchQuery === item.searchQuery)
    );

    return uniqueItems;
  }
}

export default UserSearchService;
