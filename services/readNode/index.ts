// services/readNode/index.ts
import getDynamoDBClient from "@/libs/aws/index";
import axios from "axios";
import { createId } from "@paralleldrive/cuid2";
import moment from "moment";

const dynamoDB = getDynamoDBClient();

const TABLE_NAME = "ReadNodes";

export class ReadNodeService {
  async create(args: { data: Omit<ReadNode, "id"> }): Promise<ReadNode> {
    const id = createId();
    const newItem = { ...args.data, id, createdAt: new Date().toISOString() };

    const params = {
      TableName: TABLE_NAME,
      Item: newItem,
    };

    await dynamoDB.put(params).promise();
    return newItem;
  }

  async find(args: {
    where: { userId: string; globalId?: string; createdAt?: { gte: Date } };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<ReadNode | null> {
    const { userId, globalId, createdAt } = args.where;
    let keyConditionExpression = "userId = :userId";
    const expressionAttributeValues: any = { ":userId": userId };

    if (globalId) {
      keyConditionExpression += " AND globalId = :globalId";
      expressionAttributeValues[":globalId"] = globalId;
    }
    if (createdAt) {
      keyConditionExpression += " AND createdAt >= :gte";
      expressionAttributeValues[":gte"] = createdAt.gte.toISOString();
    }

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: args.orderBy?.createdAt === "asc" ? true : false, // Ascending or descending
      Limit: 1, // Get the most recent one
    };

    const data = await dynamoDB.query(params).promise();
    return data.Items ? (data.Items[0] as ReadNode) : null;
  }

  async findMany(args: {
    where: {
      userId: string;
      paperId?: string;
      createdAt?: { gte: string; lte: string };
    };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<ReadNode[]> {
    const { userId, paperId, createdAt } = args.where;

    const expressionAttributeValues: any = { ":userId": userId };
    let keyConditionExpression = "userId = :userId";

    if (paperId) {
      keyConditionExpression += " AND paperId = :paperId";
      expressionAttributeValues[":paperId"] = paperId;
    }
    if (createdAt) {
      keyConditionExpression += " AND createdAt BETWEEN :gte AND :lte";
      expressionAttributeValues[":gte"] = moment
        .utc(createdAt.gte)
        .toISOString();
      expressionAttributeValues[":lte"] = moment
        .utc(createdAt.lte)
        .toISOString();
    }

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: args.orderBy?.createdAt === "asc" ? true : false, // Ascending or descending
    };

    const data = await dynamoDB.query(params).promise();
    return data.Items as ReadNode[];
  }

  async deleteMany(args: {
    where: { userId: string };
  }): Promise<{ count: number }> {
    const { userId } = args.where;

    const items = await this.findMany({ where: { userId } });
    const deletePromises = items.map((item) =>
      dynamoDB.delete({ TableName: TABLE_NAME, Key: { id: item.id } }).promise()
    );

    await Promise.all(deletePromises);
    return { count: items.length };
  }

  async getNodesByPaperSectionParagraphIds(
    paperSectionParagraphIds: string[]
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST
        }/api/v1/urantia-book/paragraphs?paperSectionParagraphIds=${paperSectionParagraphIds.join(
          ","
        )}`
      );
      return response.data?.data?.results;
    } catch (error) {
      console.error("Unable to fetch nodes by paperSectionParagraphIds", error);
      return [];
    }
  }
}

export default ReadNodeService;
