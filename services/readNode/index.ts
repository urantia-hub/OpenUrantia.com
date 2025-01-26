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
    where: { userId: string; globalId?: string; createdAt?: { gte: string } };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<ReadNode | null> {
    const { userId, globalId, createdAt } = args.where;
    let keyConditionExpression = "userId = :userId";
    const expressionAttributeValues: any = { ":userId": userId };

    if (createdAt) {
      keyConditionExpression += " AND createdAt >= :gte";
      expressionAttributeValues[":gte"] = createdAt.gte;
    } else {
      keyConditionExpression += " AND createdAt = :dummyCreatedAt";
      expressionAttributeValues[":dummyCreatedAt"] = "1970-01-01T00:00:00.000Z"; // Default minimal value
    }

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: args.orderBy?.createdAt === "asc" ? true : false, // Ascending or descending
      Limit: 1, // Get the most recent one
      ...(globalId && {
        FilterExpression: "globalId = :globalId",
        ExpressionAttributeValues: {
          ...expressionAttributeValues,
          ":globalId": globalId,
        },
      }),
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

    if (createdAt) {
      keyConditionExpression += " AND createdAt BETWEEN :gte AND :lte";
      expressionAttributeValues[":gte"] = createdAt.gte;
      expressionAttributeValues[":lte"] = createdAt.lte;
    } else {
      keyConditionExpression += " AND createdAt >= :dummyCreatedAt";
      expressionAttributeValues[":dummyCreatedAt"] = "1970-01-01T00:00:00.000Z"; // Default minimal value
    }

    const params = {
      TableName: TABLE_NAME,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: args.orderBy?.createdAt === "asc" ? true : false, // Ascending or descending
      ...(paperId && {
        FilterExpression: "paperId = :paperId",
        ExpressionAttributeValues: {
          ...expressionAttributeValues,
          ":paperId": paperId,
        },
      }),
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

  async findReadsForPopularPapers(
    startDate: Date,
    endDate: Date
  ): Promise<ReadNode[]> {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "createdAt-index",
      KeyConditionExpression: "createdAt BETWEEN :startDate AND :endDate",
      ExpressionAttributeValues: {
        ":startDate": startDate.toISOString(),
        ":endDate": endDate.toISOString(),
      },
      ProjectionExpression: "paperId",
    };

    const data = await dynamoDB.query(params).promise();
    return data.Items as ReadNode[];
  }
}

export default ReadNodeService;
