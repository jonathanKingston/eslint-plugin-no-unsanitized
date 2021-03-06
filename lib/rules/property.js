/* global module */
/**
 * @fileoverview ESLint rule to disallow unsanitized property assignment
 * @author Frederik Braun et al.
 * @copyright 2015-2017 Mozilla Corporation. All rights reserved.
 */
"use strict";

const RuleHelper = require("../ruleHelper");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "ESLint rule to disallow unsanitized property assignment",
            category: "possible-errors"
        },
        /* schema statement TBD until we have options
        schema: [
            {
                type: array
            }
        ]*/
    },
    create(context) {
        const ruleHelper = new RuleHelper(context);

        // operators to not check, such as X.innerHTML *= 12; is likely very safe
        // This list explicitly doesn't check ["=", "+="] or any newer operators that have not been reviewed
        // - https://github.com/estree/estree/blob/master/es5.md#assignmentoperator
        // - https://github.com/estree/estree/blob/master/es2016.md#assignmentoperator
        const PERMITTED_OPERATORS = ["-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&=", "**="];

        // operators to match against, such as X.innerHTML += foo
        const CHECK_REQUIRED_OPERATORS = ["=", "+="];

        return {
            AssignmentExpression(node) {
                // called when an identifier is found in the tree.
                // the "exit" prefix ensures we know all subnodes already.
                if ("property" in node.left) {
                    // If we don't have an operator we safely ignore
                    if (PERMITTED_OPERATORS.indexOf(node.operator) === -1) {
                        if (CHECK_REQUIRED_OPERATORS.indexOf(node.operator) === -1) {
                            ruleHelper.reportUnsupported(node, "Unexpected Assignment", "Unsupported Operator for AssignmentExpression");
                        }
                        if ((node.left.property.name === "innerHTML") ||
                            (node.left.property.name === "outerHTML")) {
                            if (!ruleHelper.allowedExpression(node.right)) {
                                context.report(node, `Unsafe assignment to ${node.left.property.name}`);
                            }
                        }
                    }
                }
            },
        };
    }
};
