//@ts-nocheck
// Generated from src/data/expression-parser/Expression.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `ExpressionParser`.
 */
export interface ExpressionListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.expr`.
	 * @param ctx the parse tree
	 */
	enterExpr?: (ctx: ExprContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.expr`.
	 * @param ctx the parse tree
	 */
	exitExpr?: (ctx: ExprContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.programVariable`.
	 * @param ctx the parse tree
	 */
	enterProgramVariable?: (ctx: ProgramVariableContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.programVariable`.
	 * @param ctx the parse tree
	 */
	exitProgramVariable?: (ctx: ProgramVariableContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.numericLiteral`.
	 * @param ctx the parse tree
	 */
	enterNumericLiteral?: (ctx: NumericLiteralContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.numericLiteral`.
	 * @param ctx the parse tree
	 */
	exitNumericLiteral?: (ctx: NumericLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.integerLiteral`.
	 * @param ctx the parse tree
	 */
	enterIntegerLiteral?: (ctx: IntegerLiteralContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.integerLiteral`.
	 * @param ctx the parse tree
	 */
	exitIntegerLiteral?: (ctx: IntegerLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.programRuleStringVariableName`.
	 * @param ctx the parse tree
	 */
	enterProgramRuleStringVariableName?: (ctx: ProgramRuleStringVariableNameContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.programRuleStringVariableName`.
	 * @param ctx the parse tree
	 */
	exitProgramRuleStringVariableName?: (ctx: ProgramRuleStringVariableNameContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.stringLiteral`.
	 * @param ctx the parse tree
	 */
	enterStringLiteral?: (ctx: StringLiteralContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.stringLiteral`.
	 * @param ctx the parse tree
	 */
	exitStringLiteral?: (ctx: StringLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.booleanLiteral`.
	 * @param ctx the parse tree
	 */
	enterBooleanLiteral?: (ctx: BooleanLiteralContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.booleanLiteral`.
	 * @param ctx the parse tree
	 */
	exitBooleanLiteral?: (ctx: BooleanLiteralContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.programRuleVariableName`.
	 * @param ctx the parse tree
	 */
	enterProgramRuleVariableName?: (ctx: ProgramRuleVariableNameContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.programRuleVariableName`.
	 * @param ctx the parse tree
	 */
	exitProgramRuleVariableName?: (ctx: ProgramRuleVariableNameContext) => void;

	/**
	 * Enter a parse tree produced by `ExpressionParser.programRuleVariablePart`.
	 * @param ctx the parse tree
	 */
	enterProgramRuleVariablePart?: (ctx: ProgramRuleVariablePartContext) => void;
	/**
	 * Exit a parse tree produced by `ExpressionParser.programRuleVariablePart`.
	 * @param ctx the parse tree
	 */
	exitProgramRuleVariablePart?: (ctx: ProgramRuleVariablePartContext) => void;
}

