import prisma from "../config/database";
import { UserResponseDto } from "../dto/user";

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<UserResponseDto[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true, 
    },
  });
  return users;
};

/**
 * Get user by ID
 */
export const getUserById = async (
  id: number
): Promise<UserResponseDto | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
  return user;
};

/**
 * Create a new user
 */
export const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<UserResponseDto> => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password, 
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true, 
    },
  });
  return user;
};

/**
 * Update user by ID
 */
export const updateUser = async (
  id: number,
  data: Partial<{ name: string; email: string; password: string }>
): Promise<UserResponseDto | null> => {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
  return user;
};

/**
 * Delete user by ID
 */
export const deleteUser = async (
  id: number
): Promise<UserResponseDto | null> => {
  const user = await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
  return user;
};
