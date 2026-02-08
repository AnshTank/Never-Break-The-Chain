import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface AuthorizedUser {
  userId: string;
  email: string;
}

export interface AuthorizationResult {
  success: boolean;
  user?: AuthorizedUser;
  error?: string;
  statusCode?: number;
}

/**
 * Validates JWT token and returns user information
 */
export async function validateAuth(request: NextRequest): Promise<AuthorizationResult> {
  try {
    const user = getUserFromRequest(request);
    
    if (!user?.userId || !user?.email) {
      return {
        success: false,
        error: 'Unauthorized - Invalid or missing token',
        statusCode: 401
      };
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Unauthorized - Token validation failed',
      statusCode: 401
    };
  }
}

/**
 * Validates that user exists in database and is active
 */
export async function validateUserExists(userId: string): Promise<AuthorizationResult> {
  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    const user = await users.findOne(
      { email: userId },
      { projection: { email: 1, isActive: 1 } }
    );
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 404
      };
    }
    
    // Check if user is active (if isActive field exists)
    if (user.isActive === false) {
      return {
        success: false,
        error: 'Account is deactivated',
        statusCode: 403
      };
    }

    return {
      success: true,
      user: {
        userId: userId,
        email: user.email
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Database error during user validation',
      statusCode: 500
    };
  }
}

/**
 * Validates that a resource belongs to the authenticated user
 */
export async function validateResourceOwnership(
  userId: string, 
  collection: string, 
  resourceId?: string,
  additionalQuery?: object
): Promise<AuthorizationResult> {
  try {
    const { db } = await connectToDatabase();
    const coll = db.collection(collection);
    
    let query: any = { userId: userId };
    
    // Add resource ID if provided
    if (resourceId) {
      query._id = new ObjectId(resourceId);
    }
    
    // Add additional query parameters
    if (additionalQuery) {
      query = { ...query, ...additionalQuery };
    }
    
    const resource = await coll.findOne(query);
    
    if (!resource) {
      return {
        success: false,
        error: 'Resource not found or access denied',
        statusCode: 404
      };
    }

    return {
      success: true,
      user: {
        userId: userId,
        email: '' // Email not needed for resource validation
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Database error during resource validation',
      statusCode: 500
    };
  }
}

/**
 * Complete authorization check: validates token, user existence, and optional resource ownership
 */
export async function authorizeRequest(
  request: NextRequest,
  options?: {
    checkUserExists?: boolean;
    resourceCollection?: string;
    resourceId?: string;
    additionalQuery?: object;
  }
): Promise<AuthorizationResult> {
  // Step 1: Validate JWT token
  const authResult = await validateAuth(request);
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  const { userId } = authResult.user;

  // Step 2: Validate user exists (optional)
  if (options?.checkUserExists) {
    const userResult = await validateUserExists(userId);
    if (!userResult.success) {
      return userResult;
    }
  }

  // Step 3: Validate resource ownership (optional)
  if (options?.resourceCollection) {
    const resourceResult = await validateResourceOwnership(
      userId,
      options.resourceCollection,
      options.resourceId,
      options.additionalQuery
    );
    if (!resourceResult.success) {
      return resourceResult;
    }
  }

  return {
    success: true,
    user: authResult.user
  };
}

/**
 * Helper function to create consistent error responses
 */
export function createAuthErrorResponse(result: AuthorizationResult) {
  return new Response(
    JSON.stringify({ error: result.error }),
    { 
      status: result.statusCode || 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}