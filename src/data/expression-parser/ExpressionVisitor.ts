//@ts-nocheck
// Generated from src/data/expression-parser/Expression.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ExpressionContext } from "./ExpressionParser";
import { ExprContext } from "./ExpressionParser";
import { ProgramVariableContext } from "./ExpressionParser";
import { NumericLiteralContext } from "./ExpressionParser";
import { IntegerLiteralContext } from "./ExpressionParser";
import { ProgramRuleStringVariableNameContext } from "./ExpressionParser";
import { StringLiteralContext } from "./ExpressionParser";
import { BooleanLiteralContext } from "./ExpressionParser";
import { ProgramRuleVariableNameContext } from "./ExpressionParser";
import { ProgramRuleVariablePartContext } from "./ExpressionParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ExpressionParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface ExpressionVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.expr`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpr?: (ctx: ExprContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.programVariable`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgramVariable?: (ctx: ProgramVariableContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.numericLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumericLiteral?: (ctx: NumericLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.integerLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIntegerLiteral?: (ctx: IntegerLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.programRuleStringVariableName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgramRuleStringVariableName?: (ctx: ProgramRuleStringVariableNameContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.stringLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringLiteral?: (ctx: StringLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.booleanLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBooleanLiteral?: (ctx: BooleanLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.programRuleVariableName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgramRuleVariableName?: (ctx: ProgramRuleVariableNameContext) => Result;

	/**
	 * Visit a parse tree produced by `ExpressionParser.programRuleVariablePart`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitProgramRuleVariablePart?: (ctx: ProgramRuleVariablePartContext) => Result;
}

